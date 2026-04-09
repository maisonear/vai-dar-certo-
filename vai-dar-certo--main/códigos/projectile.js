// projectile.js - Projectile system for Solo Leveling RPG

class Projectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx;
        this.vy = config.vy;
        this.speed = config.speed || 5;
        this.damage = config.damage || 10;
        this.ownerType = config.ownerType; // 'player' or 'enemy'
        this.type = config.type || 'normal';
        this.radius = config.radius || 8;
        this.lifeTime = config.lifeTime || 3; // seconds
        this.isDead = false;
        this.color = config.color || '#8b5cf6';
    }

    update(deltaTime, world) {
        this.lifeTime -= deltaTime;
        if (this.lifeTime <= 0) {
            this.isDead = true;
            return;
        }

        const nextX = this.x + this.vx * this.speed * deltaTime * 60;
        const nextY = this.y + this.vy * this.speed * deltaTime * 60;

        // Collision with world
        if (world && !world.isWalkable(nextX, nextY, this.radius)) {
            this.isDead = true;
            return;
        }

        this.x = nextX;
        this.y = nextY;
    }
}
