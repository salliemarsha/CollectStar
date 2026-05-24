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

const game =
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



    function platform(
        scene,
        x,
        y,
        w,
        h
    ) {

        const r =
            scene.add.rectangle(
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
                r,
                true
            );

        platforms.add(
            r
        );

    }



    platform(
        this,
        63,
        360,
        126,
        12
    );

    platform(
        this,
        398,
        236,
        178,
        12
    );

    platform(
        this,
        530,
        206,
        210,
        12
    );

    platform(
        this,
        660,
        236,
        185,
        12
    );

    platform(
        this,
        744,
        356,
        110,
        12
    );

    platform(
        this,
        405,
        556,
        560,
        12
    );



    player =
        this.physics
            .add
            .image(
                70,
                290,
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
                        340,

                    y:
                        150,

                    stepX:
                        90

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
            -580
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

                    150,

                    true,

                    true

                );

            }

        );

    }

}