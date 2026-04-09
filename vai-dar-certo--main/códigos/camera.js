// camera.js - Dynamic Camera System for Solo Leveling RPG

class Camera {
    constructor(canvasWidth, canvasHeight) {
        // Camera position (top-left corner in world space)
        this.x = 0;
        this.y = 0;

        // Viewport dimensions
        this.viewWidth = canvasWidth || 1920;
        this.viewHeight = canvasHeight || 1080;

        // Smooth follow settings
        this.lerpFactor = 0.08;      // Lower = smoother/slower follow
        this.deadZone = 2;            // Pixels of tolerance before camera moves

        // Shake effect (for impacts)
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    // Follow a target (player) with smooth interpolation
    follow(target, deltaTime) {
        if (!target) return;

        // Desired camera position = target centered on screen
        const desiredX = target.x - this.viewWidth / 2;
        const desiredY = target.y - this.viewHeight / 2;

        // Lerp toward desired position
        const dx = desiredX - this.x;
        const dy = desiredY - this.y;

        // Only move if outside dead zone
        if (Math.abs(dx) > this.deadZone) {
            this.x += dx * this.lerpFactor;
        }
        if (Math.abs(dy) > this.deadZone) {
            this.y += dy * this.lerpFactor;
        }

        // Update shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }

    // Instantly center camera on a position (no lerp)
    centerOn(x, y) {
        this.x = x - this.viewWidth / 2;
        this.y = y - this.viewHeight / 2;
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x - this.shakeOffsetX,
            y: worldY - this.y - this.shakeOffsetY
        };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x + this.shakeOffsetX,
            y: screenY + this.y + this.shakeOffsetY
        };
    }

    // Check if a world position is visible on screen (with optional margin)
    isVisible(worldX, worldY, margin = 100) {
        return worldX > this.x - margin &&
               worldX < this.x + this.viewWidth + margin &&
               worldY > this.y - margin &&
               worldY < this.y + this.viewHeight + margin;
    }

    // Check if a rectangle in world space is visible
    isRectVisible(wx, wy, w, h, margin = 0) {
        return wx + w > this.x - margin &&
               wx < this.x + this.viewWidth + margin &&
               wy + h > this.y - margin &&
               wy < this.y + this.viewHeight + margin;
    }

    // Get the camera offset for ctx.translate
    getOffsetX() {
        return -(this.x + this.shakeOffsetX);
    }

    getOffsetY() {
        return -(this.y + this.shakeOffsetY);
    }

    // Trigger camera shake
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
}
