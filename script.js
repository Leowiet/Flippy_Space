        class SpaceFlappyShooter {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.gameUI = document.getElementById('gameUI');
                this.gameOverScreen = document.getElementById('gameOverScreen');
                this.scoreElement = document.getElementById('score');
                this.livesElement = document.getElementById('lives');
                this.finalScoreElement = document.getElementById('finalScore');
                this.restartBtn = document.getElementById('restartBtn');
                
                // Game state
                this.gameRunning = true;
                this.score = 0;
                this.lives = 3;
                this.gameSpeed = 2;
                
                // Player properties
                this.player = {
                    x: 100,
                    y: 250,
                    width: 50,
                    height: 30,
                    originalWidth: 50,
                    originalHeight: 30,
                    velocity: 0,
                    gravity: 0.5,
                    jumpPower: -12,
                    originalJumpPower: -12,
                    element: null,
                    hasShield: false,
                    shieldTime: 0,
                    hasSpeed: false,
                    speedTime: 0,
                    isShrunk: false,
                    shrinkTime: 0,
                    isCursed: false,
                    curseTime: 0
                };
                
                // Game objects
                this.obstacles = [];
                this.bullets = [];
                this.powerups = [];
                this.explosions = [];
                
                // Timing
                this.lastObstacleTime = 0;
                this.lastPowerupTime = 0;
                this.gameTime = 0;
                
                this.init();
            }
            
            init() {
                this.createPlayer();
                this.bindEvents();
                this.gameLoop();
            }
            
            createPlayer() {
                this.player.element = document.createElement('div');
                this.player.element.className = 'player';
                this.player.element.style.left = this.player.x + 'px';
                this.player.element.style.top = this.player.y + 'px';
                
                // Create thruster elements
                const thrusterLeft = document.createElement('div');
                thrusterLeft.className = 'thruster-left';
                this.player.element.appendChild(thrusterLeft);
                
                const thrusterRight = document.createElement('div');
                thrusterRight.className = 'thruster-right';
                this.player.element.appendChild(thrusterRight);
                
                // Create wing elements
                const wingTop = document.createElement('div');
                wingTop.className = 'wing-top';
                this.player.element.appendChild(wingTop);
                
                const wingBottom = document.createElement('div');
                wingBottom.className = 'wing-bottom';
                this.player.element.appendChild(wingBottom);
                
                this.canvas.appendChild(this.player.element);
            }
            
            bindEvents() {
                // Mouse controls
                this.canvas.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!this.gameRunning) return;
                    
                    if (e.button === 0) { // Left click
                        this.flap();
                    }
                });
                
                this.canvas.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
                
                // Mobile control buttons
                const flapBtn = document.getElementById('flapBtn');
                const shootBtn = document.getElementById('shootBtn');
                
                if (flapBtn) {
                    flapBtn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        if (!this.gameRunning) return;
                        this.flap();
                    });
                    
                    flapBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (!this.gameRunning) return;
                        this.flap();
                    });
                }
                
                if (shootBtn) {
                    shootBtn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        if (!this.gameRunning) return;
                        this.shoot();
                    });
                    
                    shootBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (!this.gameRunning) return;
                        this.shoot();
                    });
                }
                
                // Touch controls for canvas (fallback for non-mobile button areas)
                let touchStartTime = 0;
                let isHolding = false;
                
                this.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (!this.gameRunning) return;
                    
                    touchStartTime = Date.now();
                    isHolding = true;
                    
                    setTimeout(() => {
                        if (isHolding) {
                            this.shoot();
                        }
                    }, 200);
                });
                
                this.canvas.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (!this.gameRunning) return;
                    
                    const touchDuration = Date.now() - touchStartTime;
                    isHolding = false;
                    
                    if (touchDuration < 200) {
                        this.flap();
                    }
                });
                
                // Keyboard controls
                document.addEventListener('keydown', (e) => {
                    if (!this.gameRunning) return;
                    
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.shoot();
                    }
                });
                
                // Restart button
                this.restartBtn.addEventListener('click', () => {
                    this.restart();
                });
                
                // Keyboard controls (optional)
                document.addEventListener('keydown', (e) => {
                    if (!this.gameRunning) return;
                    
                    if (e.code === 'Space') {
                        e.preventDefault();
                        this.flap();
                    } else if (e.code === 'KeyX') {
                        e.preventDefault();
                        this.shoot();
                    }
                });
            }
            
            flap() {
                this.player.velocity = this.player.jumpPower;
                this.player.element.style.transform = 'rotate(-15deg)';
                setTimeout(() => {
                    if (this.player.element) {
                        this.player.element.style.transform = 'rotate(0deg)';
                    }
                }, 100);
            }
            
            shoot() {
                const bullet = {
                    x: this.player.x + this.player.width,
                    y: this.player.y + this.player.height / 2,
                    width: 8,
                    height: 3,
                    speed: 8,
                    element: document.createElement('div')
                };
                
                bullet.element.className = 'bullet';
                bullet.element.style.left = bullet.x + 'px';
                bullet.element.style.top = bullet.y + 'px';
                this.canvas.appendChild(bullet.element);
                
                this.bullets.push(bullet);
            }
            
            createObstacle() {
                const size = 40 + Math.random() * 30;
                const obstacle = {
                    x: this.canvas.offsetWidth,
                    y: 50 + Math.random() * (this.canvas.offsetHeight - 150),
                    width: size,
                    height: size,
                    speed: this.gameSpeed + Math.random() * 2,
                    element: document.createElement('div'),
                    health: 1
                };
                
                obstacle.element.className = 'obstacle';
                obstacle.element.style.left = obstacle.x + 'px';
                obstacle.element.style.top = obstacle.y + 'px';
                obstacle.element.style.width = obstacle.width + 'px';
                obstacle.element.style.height = obstacle.height + 'px';
                this.canvas.appendChild(obstacle.element);
                
                this.obstacles.push(obstacle);
            }
            
            createPowerup() {
                const powerupTypes = ['shield', 'speed', 'shrink', 'curse'];
                const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                
                const powerup = {
                    x: this.canvas.offsetWidth,
                    y: 100 + Math.random() * (this.canvas.offsetHeight - 200),
                    width: type === 'shrink' ? 25 : (type === 'curse' ? 35 : 30),
                    height: type === 'shrink' ? 25 : (type === 'curse' ? 35 : 30),
                    speed: this.gameSpeed,
                    type: type,
                    element: document.createElement('div')
                };
                
                powerup.element.className = `powerup ${type}`;
                powerup.element.style.left = powerup.x + 'px';
                powerup.element.style.top = powerup.y + 'px';
                this.canvas.appendChild(powerup.element);
                
                this.powerups.push(powerup);
            }
            
            createExplosion(x, y) {
                const explosion = {
                    x: x,
                    y: y,
                    element: document.createElement('div'),
                    duration: 300
                };
                
                explosion.element.className = 'explosion';
                explosion.element.style.left = x + 'px';
                explosion.element.style.top = y + 'px';
                this.canvas.appendChild(explosion.element);
                
                this.explosions.push(explosion);
                
                setTimeout(() => {
                    if (explosion.element.parentNode) {
                        explosion.element.parentNode.removeChild(explosion.element);
                    }
                    const index = this.explosions.indexOf(explosion);
                    if (index > -1) {
                        this.explosions.splice(index, 1);
                    }
                }, explosion.duration);
            }
            
            updatePlayer() {
                // Apply gravity
                this.player.velocity += this.player.gravity;
                this.player.y += this.player.velocity;
                
                // Update shield
                if (this.player.hasShield) {
                    this.player.shieldTime--;
                    if (this.player.shieldTime <= 0) {
                        this.player.hasShield = false;
                        this.player.element.classList.remove('shield-active');
                    }
                }
                
                // Update speed boost
                if (this.player.hasSpeed) {
                    this.player.speedTime--;
                    if (this.player.speedTime <= 0) {
                        this.player.hasSpeed = false;
                        this.player.jumpPower = this.player.originalJumpPower;
                        this.player.element.classList.remove('speed-active');
                    }
                }
                
                // Update shrink effect
                if (this.player.isShrunk) {
                    this.player.shrinkTime--;
                    if (this.player.shrinkTime <= 0) {
                        this.player.isShrunk = false;
                        this.player.width = this.player.originalWidth;
                        this.player.height = this.player.originalHeight;
                        this.player.element.classList.remove('shrink-active');
                    }
                }
                
                // Update curse effect
                if (this.player.isCursed) {
                    this.player.curseTime--;
                    if (this.player.curseTime <= 0) {
                        this.player.isCursed = false;
                        this.player.width = this.player.originalWidth;
                        this.player.height = this.player.originalHeight;
                        this.player.element.classList.remove('curse-active');
                    }
                }
                
                // Boundary checking
                if (this.player.y < 0) {
                    this.player.y = 0;
                    this.player.velocity = 0;
                }
                if (this.player.y > this.canvas.offsetHeight - this.player.height) {
                    this.player.y = this.canvas.offsetHeight - this.player.height;
                    this.player.velocity = 0;
                    if (!this.player.hasShield) {
                        this.takeDamage();
                    }
                }
                
                // Update position
                this.player.element.style.top = this.player.y + 'px';
            }
            
            updateObstacles() {
                for (let i = this.obstacles.length - 1; i >= 0; i--) {
                    const obstacle = this.obstacles[i];
                    obstacle.x -= obstacle.speed;
                    obstacle.element.style.left = obstacle.x + 'px';
                    
                    // Remove off-screen obstacles
                    if (obstacle.x + obstacle.width < 0) {
                        obstacle.element.parentNode.removeChild(obstacle.element);
                        this.obstacles.splice(i, 1);
                        this.score += 10; // Score for surviving
                        continue;
                    }
                    
                    // Check collision with player
                    if (this.checkCollision(this.player, obstacle)) {
                        if (!this.player.hasShield) {
                            this.createExplosion(obstacle.x, obstacle.y);
                            obstacle.element.parentNode.removeChild(obstacle.element);
                            this.obstacles.splice(i, 1);
                            this.takeDamage();
                        }
                    }
                }
            }
            
            updateBullets() {
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const bullet = this.bullets[i];
                    bullet.x += bullet.speed;
                    bullet.element.style.left = bullet.x + 'px';
                    
                    // Remove off-screen bullets
                    if (bullet.x > this.canvas.offsetWidth) {
                        bullet.element.parentNode.removeChild(bullet.element);
                        this.bullets.splice(i, 1);
                        continue;
                    }
                    
                    // Check collision with obstacles
                    for (let j = this.obstacles.length - 1; j >= 0; j--) {
                        const obstacle = this.obstacles[j];
                        if (this.checkCollision(bullet, obstacle)) {
                            // Create explosion
                            this.createExplosion(obstacle.x, obstacle.y);
                            
                            // Remove bullet
                            bullet.element.parentNode.removeChild(bullet.element);
                            this.bullets.splice(i, 1);
                            
                            // Remove obstacle
                            obstacle.element.parentNode.removeChild(obstacle.element);
                            this.obstacles.splice(j, 1);
                            
                            // Add score
                            this.score += 50;
                            break;
                        }
                    }
                }
            }
            
            updatePowerups() {
                for (let i = this.powerups.length - 1; i >= 0; i--) {
                    const powerup = this.powerups[i];
                    powerup.x -= powerup.speed;
                    powerup.element.style.left = powerup.x + 'px';
                    
                    // Remove off-screen powerups
                    if (powerup.x + powerup.width < 0) {
                        powerup.element.parentNode.removeChild(powerup.element);
                        this.powerups.splice(i, 1);
                        continue;
                    }
                    
                    // Check collision with player
                    if (this.checkCollision(this.player, powerup)) {
                        this.collectPowerup(powerup.type);
                        powerup.element.parentNode.removeChild(powerup.element);
                        this.powerups.splice(i, 1);
                    }
                }
            }
            
            collectPowerup(type) {
                if (type === 'shield') {
                    this.player.hasShield = true;
                    this.player.shieldTime = 300; // 5 seconds at 60fps
                    this.player.element.classList.add('shield-active');
                    this.score += 25;
                } else if (type === 'speed') {
                    this.player.hasSpeed = true;
                    this.player.speedTime = 240; // 4 seconds at 60fps
                    this.player.jumpPower = -16; // Stronger jump
                    this.player.element.classList.add('speed-active');
                    this.score += 30;
                } else if (type === 'shrink') {
                    this.player.isShrunk = true;
                    this.player.shrinkTime = 360; // 6 seconds at 60fps
                    this.player.width = this.player.originalWidth * 0.7;
                    this.player.height = this.player.originalHeight * 0.7;
                    this.player.element.classList.add('shrink-active');
                    this.score += 40;
                } else if (type === 'curse') {
                    this.player.isCursed = true;
                    this.player.curseTime = 300; // 5 seconds at 60fps
                    this.player.width = this.player.originalWidth * 1.4;
                    this.player.height = this.player.originalHeight * 1.4;
                    this.player.element.classList.add('curse-active');
                    this.score += 10; // Less points for curse
                }
            }
            
            takeDamage() {
                this.lives--;
                this.livesElement.textContent = this.lives;
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
            
            checkCollision(obj1, obj2) {
                return obj1.x < obj2.x + obj2.width &&
                       obj1.x + obj1.width > obj2.x &&
                       obj1.y < obj2.y + obj2.height &&
                       obj1.y + obj1.height > obj2.y;
            }
            
            gameOver() {
                this.gameRunning = false;
                this.finalScoreElement.textContent = this.score;
                this.gameOverScreen.style.display = 'flex';
            }
            
            restart() {
                // Reset game state
                this.gameRunning = true;
                this.score = 0;
                this.lives = 3;
                this.gameTime = 0;
                this.gameSpeed = 2;
                
                // Reset player
                this.player.y = 250;
                this.player.velocity = 0;
                this.player.hasShield = false;
                this.player.shieldTime = 0;
                this.player.hasSpeed = false;
                this.player.speedTime = 0;
                this.player.isShrunk = false;
                this.player.shrinkTime = 0;
                this.player.isCursed = false;
                this.player.curseTime = 0;
                this.player.width = this.player.originalWidth;
                this.player.height = this.player.originalHeight;
                this.player.jumpPower = this.player.originalJumpPower;
                this.player.element.classList.remove('shield-active', 'speed-active', 'shrink-active', 'curse-active');
                
                // Clear all game objects
                [...this.obstacles, ...this.bullets, ...this.powerups, ...this.explosions].forEach(obj => {
                    if (obj.element && obj.element.parentNode) {
                        obj.element.parentNode.removeChild(obj.element);
                    }
                });
                
                this.obstacles = [];
                this.bullets = [];
                this.powerups = [];
                this.explosions = [];
                
                // Update UI
                this.scoreElement.textContent = this.score;
                this.livesElement.textContent = this.lives;
                this.gameOverScreen.style.display = 'none';
                
                // Reset timing
                this.lastObstacleTime = 0;
                this.lastPowerupTime = 0;
            }
            
            gameLoop() {
                if (this.gameRunning) {
                    this.gameTime++;
                    
                    // Update game objects
                    this.updatePlayer();
                    this.updateObstacles();
                    this.updateBullets();
                    this.updatePowerups();
                    
                    // Spawn obstacles
                    if (this.gameTime - this.lastObstacleTime > 120 - Math.min(this.gameTime / 200, 60)) {
                        this.createObstacle();
                        this.lastObstacleTime = this.gameTime;
                    }
                    
                    // Spawn powerups
                    if (this.gameTime - this.lastPowerupTime > 600 + Math.random() * 300) {
                        this.createPowerup();
                        this.lastPowerupTime = this.gameTime;
                    }
                    
                    // Increase difficulty over time
                    this.gameSpeed = Math.min(2 + this.gameTime / 1000, 5);
                    
                    // Update score display
                    this.scoreElement.textContent = this.score;
                }
                
                requestAnimationFrame(() => this.gameLoop());
            }
        }
        
        // Start the game when page loads
        window.addEventListener('load', () => {
            new SpaceFlappyShooter();
        });