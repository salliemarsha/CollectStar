const config = {
    type: Phaser.AUTO,

    width: 800,

    height: 600,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter:
            Phaser.Scale.CENTER_BOTH
    },

    physics: {

        default:
            'arcade',

        arcade: {

            gravity: {
                y: 700
            },

            debug: false

        }

    },

    scene: {
        preload,
        create,
        update
    }

};

new Phaser.Game(
    config
);

let player;

let stars;

let platforms;

let cursors;

let score = 0;

let scoreText;



function preload() {

    this.load.image(
        'bg',
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

    this.add
        .image(
            400,
            300,
            'bg'
        )
        .setDisplaySize(
            800,
            600
        );



    platforms =
        this.physics
            .add
            .staticGroup();



    function addPlatform(
        scene,
        x,
        y,
        w,
        h = 6
    ) {

        const p =
            scene.add
                .rectangle(
                    x,
                    y,
                    w,
                    h,
                    0xffffff,
                    0
                );

        scene.physics
            .add
            .existing(
                p,
                true
            );

        platforms.add(
            p
        );

        return p;

    }



    addPlatform(
        this,
        64,
        296,
        128
    );



    addPlatform(
        this,
        247,
        222,
        50
    );

    addPlatform(
        this,
        292,
        216,
        55
    );

    addPlatform(
        this,
        338,
        210,
        50
    );



    addPlatform(
        this,
        400,
        192,
        118
    );



    addPlatform(
        this,
        463,
        210,
        50
    );

    addPlatform(
        this,
        510,
        216,
        55
    );

    addPlatform(
        this,
        556,
        222,
        50
    );



    addPlatform(
        this,
        735,
        276,
        130
    );



    addPlatform(
        this,
        400,
        398,
        610
    );



    player =
        this.physics
            .add
            .image(
                70,
                240,
                'girl'
            );

    player.setScale(
        0.18
    );

    player.setBounce(
        0
    );

    player.setCollideWorldBounds(
        true
    );

    player.body.setSize(
        player.width *
        0.55,

        player.height *
        0.9
    );

    player.body.setOffset(
        player.width *
        0.22,

        player.height *
        0.05
    );



    stars =
        this.physics
            .add
            .group({

                key:
                    'star',

                repeat:
                    4,

                setXY: {

                    x:
                        300,

                    y:
                        140,

                    stepX:
                        95

                }

            });



    stars.children.iterate(

        function (
            child
        ) {

            child.setScale(
                0.08
            );

            child.setBounceY(
                0
            );

        }

    );



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



    this.physics
        .add
        .collider(
            player,
            platforms
        );

    this.physics
        .add
        .collider(
            stars,
            platforms
        );



    this.physics
        .add
        .overlap(
            player,
            stars,
            collectStar,
            null,
            this
        );



    cursors =
        this.input
            .keyboard
            .createCursorKeys();

}



function update() {

    if (
        cursors.left.isDown
    ) {

        player.setVelocityX(
            -230
        );

    }

    else if (
        cursors.right.isDown
    ) {

        player.setVelocityX(
            230
        );

    }

    else {

        player.setVelocityX(
            0
        );

    }



    if (

        cursors.up.isDown &&

        (
            player.body.blocked.down ||

            player.body.touching.down
        )

    ) {

        player.setVelocityY(
            -640
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

                    140,

                    true,

                    true

                );

            }

        );

    }

}