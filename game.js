const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: false, // Set to true if using pixel art
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 1100 }, 
            debug: false,
            fps: 60,
            fixedStep: true, // Crucial for stability in 3.60+
            tileBias: 64,    // Prevent tunneling and micro-shaking
            overlapBias: 10  // Improve resolution stability
        } 
    },
    scene: { preload, create, update }
};

new Phaser.Game(config);

let player, stars, platforms, visualGroup, cursors, bgStars;
let score = 0, scoreText, currentLevel = 1, levelText, levelNameText;
let isSpawning = false;
let isGameOver = false;

const PLAYER_SPEED = 320;
const PLAYER_ACCEL = 1600;
const PLAYER_DRAG = 1300;
const JUMP_VELOCITY = -600;

function preload() {
    this.load.image('girl', 'assets/girl.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('platform', 'assets/platform.png');
}

function create() {
    // Background setup
    this.add.rectangle(0, 0, 800, 600, 0x0a0f2a).setOrigin(0, 0).setScrollFactor(0).setDepth(0);
    bgStars = this.add.group();
    for(let i = 0; i < 60; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 600);
        let star = this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.8), 0xffffff, 0.4);
        star.setDepth(1);
        bgStars.add(star);
    }

    platforms = this.physics.add.staticGroup();
    visualGroup = this.add.group();
    stars = this.physics.add.group();
    
    // Player Setup - Container decoupling physics from scale
    player = this.add.container(0, 0);
    const girl = this.add.sprite(0, 0, 'girl').setScale(0.18).setOrigin(0.5, 1);
    player.add(girl);
    player.girl = girl; // Reference for squash/stretch
    
    this.physics.add.existing(player);
    player.setDepth(10);
    player.body.setCollideWorldBounds(false); 
    player.body.setDragX(PLAYER_DRAG);
    player.body.setMaxVelocity(PLAYER_SPEED, 900);
    
    // Stable collision box on the container (constant regardless of girl's scale)
    // Height reduced to 70% to provide significant headroom
    const bW = girl.width * 0.18 * 0.50;
    const bH = girl.height * 0.18 * 0.70;
    player.body.setSize(bW, bH);
    player.body.setOffset(-bW / 2, -bH + 2); // Perfectly flush with bottom + 2px buffer

    this.physics.add.collider(player, platforms, onPlatformCollide, null, this);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    const uiStyle = { fontSize: '24px', fontFamily: 'Arial', fill: '#fff', stroke: '#000', strokeThickness: 5 };
    scoreText = this.add.text(25, 25, 'Score: 0', uiStyle).setDepth(100);
    levelText = this.add.text(775, 25, 'Level: 1/5', uiStyle).setOrigin(1, 0).setDepth(100);

    levelNameText = this.add.text(400, 25, '', { 
        fontSize: '28px', fontFamily: 'Arial', fill: '#ffd700', stroke: '#000', strokeThickness: 5, fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(100);
    
    cursors = this.input.keyboard.createCursorKeys();
    loadLevel(this, currentLevel);
}

function createPlatform(scene, x, y, w, h) {
    const shadow = scene.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.3).setDepth(4);
    const plat = scene.add.tileSprite(x, y, w, h, 'platform').setDepth(5);
    scene.physics.add.existing(plat, true);
    plat.body.updateFromGameObject();
    platforms.add(plat);
    visualGroup.add(shadow);
    visualGroup.add(plat);
}

function resetGameState(scene) {
    score = 0;
    currentLevel = 1;
    isGameOver = false;
    isSpawning = false;
    scoreText.setText('Score: 0');
    player.girl.clearTint();
    player.girl.setScale(0.18);
    player.body.setEnable(true);
    
    // Destroy ALL specific UI elements by tag/content to ensure clean state
    scene.children.list.filter(c => c.type === 'Text' && ['GAME OVER', 'TRY AGAIN', 'YOU WIN!', 'PLAY AGAIN'].includes(c.text))
        .forEach(c => c.destroy());
}

function safeSpawnPlayer(scene, start) {
    isSpawning = true;
    player.body.setAllowGravity(false);
    player.body.setVelocity(0, 0);
    player.body.setAcceleration(0, 0);
    player.setAlpha(0);
    player.girl.setScale(0.18); 
    
    player.setPosition(start.x, start.y - 150);
    player.body.reset(player.x, player.y);
    
    scene.tweens.add({
        targets: player,
        alpha: 1,
        y: start.y - 40, 
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
            player.body.reset(player.x, player.y);
            player.body.setAllowGravity(true);
            isSpawning = false;
        }
    });
}

function loadLevel(scene, level) {
    isSpawning = true;
    scene.physics.world.pause();
    scene.cameras.main.fadeOut(250, 0, 0, 0);
    
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        platforms.clear(true, true);
        visualGroup.clear(true, true);
        stars.clear(true, true);
        scene.tweens.killTweensOf([player, player.girl]);

        const levelData = LEVELS[level - 1];
        if (!levelData) return;

        levelNameText.setText(levelData.name);
        levelText.setText(`Level: ${level}/${LEVELS.length}`);
        levelData.platforms.forEach(p => createPlatform(scene, p.x, p.y, p.w, p.h));
        
        levelData.stars.forEach(s => {
            let star = stars.create(s.x, s.y, 'star').setScale(0.08).setDepth(8);
            star.body.setAllowGravity(false);
            scene.tweens.add({
                targets: star,
                y: s.y - 12,
                duration: 900 + Math.random() * 300,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        safeSpawnPlayer(scene, levelData.playerStart);
        scene.cameras.main.fadeIn(250, 0, 0, 0);
        scene.physics.world.resume();
    });
}

function gameOver(scene) {
    if (isGameOver) return;
    isGameOver = true;
    scene.physics.world.pause();
    player.girl.setTint(0xff0000);
    player.body.setVelocity(0, 0);
    
    const uiStyle = { fontSize: '48px', fontFamily: 'Arial', fill: '#ff0000', stroke: '#000', strokeThickness: 8, fontStyle: 'bold' };
    const gameOverText = scene.add.text(400, 250, 'GAME OVER', uiStyle).setOrigin(0.5).setDepth(200);
    
    const btnStyle = { fontSize: '32px', fontFamily: 'Arial', fill: '#fff', backgroundColor: '#8B5A2B', padding: { x: 20, y: 10 }, stroke: '#000', strokeThickness: 4 };
    const tryAgainBtn = scene.add.text(400, 350, 'TRY AGAIN', btnStyle).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
        
    tryAgainBtn.once('pointerdown', () => {
        resetGameState(scene);
        loadLevel(scene, 1);
    });
    tryAgainBtn.on('pointerover', () => tryAgainBtn.setStyle({ fill: '#ffd700' }));
    tryAgainBtn.on('pointerout', () => tryAgainBtn.setStyle({ fill: '#fff' }));
}

function update() {
    if (isSpawning || isGameOver) return;

    if (cursors.left.isDown) {
        player.body.setAccelerationX(-PLAYER_ACCEL);
        player.girl.setFlipX(true);
    } else if (cursors.right.isDown) {
        player.body.setAccelerationX(PLAYER_ACCEL);
        player.girl.setFlipX(false);
    } else {
        player.body.setAccelerationX(0);
    }

    const isGrounded = player.body.blocked.down || player.body.touching.down;
    if (cursors.up.isDown && isGrounded) {
        player.body.setVelocityY(JUMP_VELOCITY);
        this.tweens.killTweensOf(player.girl);
        this.tweens.add({
            targets: player.girl,
            scaleX: 0.14, scaleY: 0.22,
            duration: 100, yoyo: true, ease: 'Quad.easeOut',
            onComplete: () => player.girl.setScale(0.18)
        });
    }

    bgStars.getChildren().forEach(star => {
        star.x -= 0.1 * star.radius;
        if (star.x < -10) star.x = 810;
    });

    if (player.y > 650) gameOver(this);
}

function onPlatformCollide(pContainer, platform) {
    if (!pContainer.body.wasTouching.down && pContainer.body.touching.down) {
        this.tweens.killTweensOf(pContainer.girl);
        this.tweens.add({
            targets: pContainer.girl,
            scaleX: 0.23, scaleY: 0.13,
            duration: 100, yoyo: true, ease: 'Quad.easeOut',
            onComplete: () => pContainer.girl.setScale(0.18)
        });
    }
}

function collectStar(pContainer, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
    const emitter = this.add.particles(star.x, star.y, 'star', {
        speed: { min: -120, max: 120 }, angle: { min: 0, max: 360 },
        scale: { start: 0.06, end: 0 }, blendMode: 'ADD', lifespan: 600, gravityY: 300, emitting: false
    });
    emitter.explode(12);
    this.time.delayedCall(700, () => emitter.destroy());

    if (stars.countActive(true) === 0) {
        if (currentLevel < LEVELS.length) {
            currentLevel++;
            loadLevel(this, currentLevel);
        } else {
            const winText = this.add.text(400, 250, 'YOU WIN!', { 
                fontSize: '72px', fill: '#ffd700', stroke: '#000', strokeThickness: 10, fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(200);
            player.body.setEnable(false);
            const restartBtn = this.add.text(400, 380, 'PLAY AGAIN', {
                fontSize: '32px', fontFamily: 'Arial', fill: '#fff', backgroundColor: '#8B5A2B', padding: { x: 20, y: 10 }, stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(200).setInteractive({ useHandCursor: true });
            restartBtn.once('pointerdown', () => {
                resetGameState(this);
                loadLevel(this, 1);
            });
        }
    }
}
