/**
 * Living Atmosphere Canvas Engine
 * Generates realistic ambient meteorological particle simulations (rain, snow, stars, lightning, sunbeams, clouds).
 */

export class AtmosphereEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.mode = 'sunbeams';
    this.particles = [];
    this.flashes = [];
    this.stars = [];
    this.shootingStars = [];
    this.clouds = [];
    this.animationFrameId = null;
    this.isRunning = false;
    this.lastTime = performance.now();
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.resize();
    this.initMode(this.mode);
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.initMode(this.mode);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stop();
    } else {
      this.lastTime = performance.now();
      this.start();
    }
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.initMode(mode);
  }

  initMode(mode) {
    this.particles = [];
    this.shootingStars = [];
    this.flashes = [];

    const w = this.width;
    const h = this.height;

    if (mode === 'stars') {
      const count = Math.min(140, Math.floor((w * h) / 9000));
      this.stars = [];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.75,
          radius: Math.random() * 1.5 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.3,
          speed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.8 ? '#BAE6FD' : Math.random() > 0.6 ? '#FEF08A' : '#FFFFFF',
        });
      }
    } else if (mode === 'sunbeams') {
      const count = 35;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 2.5 + 1,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.4 - 0.1,
          alpha: Math.random() * 0.4 + 0.1,
          life: Math.random() * 100,
        });
      }
    } else if (mode === 'rain' || mode === 'drizzle') {
      const count = mode === 'drizzle' ? 60 : 130;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * (w + 200) - 100,
          y: Math.random() * h,
          length: Math.random() * 18 + 12,
          speed: Math.random() * 10 + 14,
          tilt: -2.5,
          alpha: Math.random() * 0.4 + 0.2,
        });
      }
    } else if (mode === 'heavy-rain' || mode === 'storm') {
      const count = 220;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * (w + 300) - 150,
          y: Math.random() * h,
          length: Math.random() * 26 + 18,
          speed: Math.random() * 16 + 22,
          tilt: -4.5,
          alpha: Math.random() * 0.5 + 0.25,
        });
      }
    } else if (mode === 'snow') {
      const count = 85;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1.5 + 0.8,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
          swayRadius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.6 + 0.3,
        });
      }
    } else if (mode === 'clouds' || mode === 'clouds-night') {
      const count = 7;
      this.clouds = [];
      for (let i = 0; i < count; i++) {
        this.clouds.push({
          x: Math.random() * w * 1.2 - w * 0.1,
          y: Math.random() * h * 0.45,
          radius: Math.random() * 180 + 120,
          vx: Math.random() * 0.15 + 0.08,
          alpha: Math.random() * 0.12 + 0.05,
        });
      }
    }
  }

  animate(currentTime) {
    if (!this.isRunning) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === 'stars') {
      this.drawStars(currentTime);
    } else if (this.mode === 'sunbeams') {
      this.drawSunbeams(delta);
    } else if (this.mode === 'rain' || this.mode === 'drizzle') {
      this.drawRain();
    } else if (this.mode === 'heavy-rain') {
      this.drawHeavyRain();
    } else if (this.mode === 'storm') {
      this.drawStorm(currentTime);
    } else if (this.mode === 'snow') {
      this.drawSnow(currentTime);
    } else if (this.mode === 'clouds' || this.mode === 'clouds-night') {
      this.drawClouds();
    } else if (this.mode === 'fog') {
      this.drawFog(currentTime);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  drawStars(currentTime) {
    for (const star of this.stars) {
      star.phase += star.speed;
      const alpha = star.baseAlpha + Math.sin(star.phase) * 0.25;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      this.ctx.fill();
    }

    // Occasional shooting star
    if (Math.random() < 0.008 && this.shootingStars.length < 2) {
      this.shootingStars.push({
        x: Math.random() * this.width * 0.8,
        y: Math.random() * this.height * 0.3,
        len: Math.random() * 90 + 50,
        speed: Math.random() * 12 + 15,
        alpha: 1,
      });
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.speed;
      s.y += s.speed * 0.6;
      s.alpha -= 0.025;

      if (s.alpha <= 0 || s.x > this.width || s.y > this.height) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x - s.len, s.y - s.len * 0.6);
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1;
  }

  drawSunbeams(delta) {
    // Subtle radiant ambient glow in upper corner
    const grad = this.ctx.createRadialGradient(
      this.width * 0.85,
      this.height * 0.15,
      20,
      this.width * 0.85,
      this.height * 0.15,
      this.width * 0.6
    );
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.12)');
    grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Floating sun motes
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += delta * 15;

      if (p.y < 0) {
        p.y = this.height;
        p.x = Math.random() * this.width;
      }

      const pulse = Math.sin(p.life * 0.1) * 0.2 + 0.8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(254, 240, 138, ${p.alpha * pulse})`;
      this.ctx.fill();
    }
  }

  drawRain() {
    this.ctx.lineWidth = 1.6;
    for (const p of this.particles) {
      p.y += p.speed;
      p.x += p.tilt;

      if (p.y > this.height) {
        p.y = -p.length;
        p.x = Math.random() * (this.width + 200) - 100;
      }

      this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x + p.tilt * 2, p.y + p.length);
      this.ctx.stroke();
    }
  }

  drawHeavyRain() {
    this.ctx.lineWidth = 2.2;
    for (const p of this.particles) {
      p.y += p.speed;
      p.x += p.tilt;

      if (p.y > this.height) {
        p.y = -p.length;
        p.x = Math.random() * (this.width + 300) - 150;
      }

      this.ctx.strokeStyle = `rgba(147, 197, 253, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x + p.tilt * 2.5, p.y + p.length);
      this.ctx.stroke();
    }
  }

  drawStorm(currentTime) {
    this.drawHeavyRain();

    // Occasional lightning flash
    if (Math.random() < 0.007 && this.flashes.length === 0) {
      this.flashes.push({
        alpha: 0.75,
        decay: 0.08,
      });
    }

    if (this.flashes.length > 0) {
      const f = this.flashes[0];
      this.ctx.fillStyle = `rgba(238, 242, 255, ${f.alpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      f.alpha -= f.decay;
      if (f.alpha <= 0) {
        this.flashes.shift();
      }
    }
  }

  drawSnow(currentTime) {
    for (const p of this.particles) {
      p.y += p.speed;
      p.swayOffset += p.swaySpeed;
      const x = p.x + Math.sin(p.swayOffset) * p.swayRadius;

      if (p.y > this.height) {
        p.y = -p.radius * 2;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      this.ctx.fill();
    }
  }

  drawClouds() {
    for (const c of this.clouds) {
      c.x += c.vx;
      if (c.x - c.radius > this.width) {
        c.x = -c.radius;
        c.y = Math.random() * this.height * 0.45;
      }

      const grad = this.ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.radius);
      grad.addColorStop(0, `rgba(241, 245, 249, ${c.alpha})`);
      grad.addColorStop(0.6, `rgba(226, 232, 240, ${c.alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawFog(currentTime) {
    const t = currentTime * 0.0003;
    const grad = this.ctx.createLinearGradient(0, this.height * 0.3, 0, this.height);
    const alpha = 0.15 + Math.sin(t) * 0.05;
    grad.addColorStop(0, 'rgba(203, 213, 225, 0)');
    grad.addColorStop(0.4, `rgba(226, 232, 240, ${alpha})`);
    grad.addColorStop(1, `rgba(148, 163, 184, ${alpha * 1.5})`);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, this.height * 0.2, this.width, this.height * 0.8);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
