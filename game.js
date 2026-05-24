const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },

    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player;
let stars;
let platforms;
let cursors;

let score = 0;
let scoreText;

function preload() {

    // FOTO
    this.load.image(
        'peta',
        'assets/platform.jpg'
    );

    this.load.image(
        'girl',
        'assets/girl.png'
    );

    this.load.image(
        'star',
        'assets/star.png'
    );
}

function create() {

    //--------------------------------
    // BACKGROUND
    //--------------------------------

    const bg =
        this.add.image(
            400,
            300,
            'peta'
        );

    bg.setDisplaySize(
        800,
        600
    );



    //--------------------------------
    // PLATFORM GAIB
    //--------------------------------

    platforms =
        this.physics.add.staticGroup();

    function buatPlatform(
        scene,
        x,
        y,
        w,
        h
    ) {

        const rect =
            scene.add.rectangle(
                x,
                y,
                w,
                h,
                0xffffff,
                0
            );

        scene.physics.add.existing(
            rect,
            true
        );

        platforms.add(
            rect
        );
    }

    // sesuaikan posisi rumput
    buatPlatform(
        this,
        90,
        330,
        180,
        20
    );

    buatPlatform(
        this,
        525,
        440,
        430,
        20
    );

    buatPlatform(
        this,
        730,
        330,
        140,
        20
    );

    buatPlatform(
        this,
        515,
        220,
        310,
        20
    );



    //--------------------------------
    // PLAYER
    //--------------------------------

    player =
        this.physics.add.image(
            90,
            200,
            'girl'
        );

    player.setScale(
        0.12
    );

    player.setBounce(
        0.1
    );

    player.setCollideWorldBounds(
        true
    );



    //--------------------------------
    // STAR
    //--------------------------------

    stars =
        this.physics.add.group({

            key:
                'star',

            repeat:
                6,

            setXY: {
                x: 120,
                y: 50,
                stepX: 90
            }

        });

    stars.children.iterate(
        function (child) {

            child.setScale(
                0.06
            );

            child.setBounceY(
                Phaser.Math.FloatBetween(
                    0.3,
                    0.4
                )
            );

        }
    );



    //--------------------------------
    // SCORE
    //--------------------------------

    scoreText =
        this.add.text(
            20,
            20,
            'Score: 0',
            {
                fontSize:
                    '28px',

                color:
                    '#ffffff',

                stroke:
                    '#000000',

                strokeThickness:
                    5
            }
        );



    //--------------------------------
    // COLLIDER
    //--------------------------------

    this.physics.add.collider(
        player,
        platforms
    );

    this.physics.add.collider(
        stars,
        platforms
    );

    this.physics.add.overlap(
        player,
        stars,
        collectStar,
        null,
        this
    );



    //--------------------------------
    // KEYBOARD
    //--------------------------------

    cursors =
        this.input.keyboard.createCursorKeys();
}

function update() {

    //--------------------------------
    // GERAK
    //--------------------------------

    if (
        cursors.left.isDown
    ) {

        player.setVelocityX(
            -180
        );

    }

    else if (
        cursors.right.isDown
    ) {

        player.setVelocityX(
            180
        );

    }

    else {

        player.setVelocityX(
            0
        );

    }



    //--------------------------------
    // LOMPAT
    //--------------------------------

    if (

        cursors.up.isDown &&

        (
            player.body.touching.down ||
            player.body.blocked.down
        )

    ) {

        player.setVelocityY(
            -400
        );

    }

}



function collectStar(
    player,
    star
) {

    star.disableBody(
        true,
        true
    );

    score += 10;

    scoreText.setText(
        'Score: ' +
        score
    );



    // spawn ulang
    if (
        stars.countActive(
            true
        ) === 0
    ) {

        stars.children.iterate(
            function (
                child
            ) {

                child.enableBody(
                    true,
                    child.x,
                    40,
                    true,
                    true
                );

            }
        );

    }

}