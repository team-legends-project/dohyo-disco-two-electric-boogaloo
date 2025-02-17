import Phaser from "phaser";

export default class StageOne extends Phaser.Scene {
  constructor() {
    super("Stage One");
    this.matchStart = false;
    this.matchEnd = false;
  }
  init(data) {
    // in selection scene set {fighter:selectedFighter} in this.scene.start
    // selected fighter is found here
    this.players = 2;
    // this.playerOne = data.player_one_sprite => to be defined by choose character
    // this.playerTwo = data.player_two_sprite => to be defined by choose character
    this.playerOneSprite = "oldMan";
    this.playerTwoSprite = "minotaur";
  }
  preload() {
    // background image of stage
    this.load.image("stageOneBG", "/textures/backgrounds/woodland.png");
  }

  create() {
    //* for debugging collision detection, shows boundary boxes
    // this.physics.world.createDebugGraphic();

    // disable controls until animations end
    this.inputEnabled = false;

    // adds assets
    this.add.sprite(-80, 30, "stageOneBG").setOrigin(0, 0).setScale(0.5);
    this.playerOne = this.physics.add
      .sprite(-50, 470, this.playerOneSprite)
      .setScale(2.5)
      .setSize(20, 60)
      .setDepth(1);

    this.playerTwo = this.physics.add
      .sprite(850, 470, this.playerTwoSprite)
      .setScale(2.5)
      .setSize(20, 60)
      .setDepth(1);
    this.referee = this.add
      .sprite(420, 430, "referee")
      .setScale(2.5)
      .setDepth(0)
      .play("idle");
    // walk on

    this.tweens.add({
      targets: this.playerOne,
      x: 200,
      duration: 2000,
      ease: "Linear",
      onUpdate: () => {
        this.playerOne.play(`${this.playerOneSprite}:left_walk_in_slow`, true);
      },
      onComplete: () => {
        this.playerOne
          .play(`${this.playerOneSprite}:left_salutation`)
          .chain(`${this.playerOneSprite}:left_face_idle`)
          .on("animationcomplete", checkAnimationsComplete);
      },
    });
    this.tweens.add({
      targets: this.playerTwo,
      x: 650,
      duration: 2000,
      ease: "Linear",
      onUpdate: () => {
        this.playerTwo.play(`${this.playerTwoSprite}:right_walk_in_slow`, true);
      },
      onComplete: () => {
        this.playerTwo
          .play(`${this.playerTwoSprite}:right_salutation`)
          .chain(`${this.playerTwoSprite}:right_face_idle`)
          .on("animationcomplete", checkAnimationsComplete);
      },
    });
    let animationsComplete = 0;
    const checkAnimationsComplete = () => {
      animationsComplete++;

      if (animationsComplete === 2) {
        this.matchStart = true;
        this.inputEnabled = true;
      }
    };
    // adds inputs
    this.keyObjects = this.input.keyboard.addKeys({
      p1Select: "W",
      p1Mash: "S",
      p1Left: "A",
      p1Right: "D",
      p2Select: "I",
      p2Mash: "K",
      p2Left: "J",
      p2Right: "L",
    });
    // collision detection
    this.physics.add.collider(
      this.playerOne,
      this.playerTwo,
      this.handlePlayerCollide
    );
    this.physics.world.gravity.y = 0;
  }
  handlePlayerCollide() {}

  update() {
    if (!this.matchStart || this.matchEnd) {
      return;
    }

    this.updatePlayerOne(this.keyObjects);
    this.updatePlayerTwo(this.keyObjects);

    if (this.playerOne.x <= 85) {
      this.declareWinner(this.playerTwo, this.playerOne, "right");
    }
    if (this.playerTwo.x >= 725) {
      this.declareWinner(this.playerOne, this.playerTwo, "left");
    }
  }
  updatePlayerOne(controller) {
    if (!this.inputEnabled) {
      return;
    }
    const speed = 200;
    const { p1Right, p1Left, p1Mash } = controller;
    if (p1Right.isDown) {
      this.playerOne.setVelocity(speed, 0);
      this.playerOne.play(`${this.playerOneSprite}:left_run`, true);
    } else if (p1Left.isDown) {
      this.playerOne.setVelocity(-speed, 0);
      this.playerOne.play(`${this.playerOneSprite}:right_run`, true);
    } else {
      this.playerOne.setVelocity(0, 0);
      this.playerOne.play(`${this.playerOneSprite}:left_face_idle`, true);
    }
  }
  updatePlayerTwo(controller) {
    const speed = 200;
    const { p2Right, p2Left, p2Mash } = controller;
    if (p2Right.isDown) {
      this.playerTwo.setVelocity(speed, 0);
      this.playerTwo.play(`${this.playerTwoSprite}:left_run`, true);
    } else if (p2Left.isDown) {
      this.playerTwo.setVelocity(-speed, 0);
      this.playerTwo.play(`${this.playerTwoSprite}:right_run`, true);
    } else {
      this.playerTwo.setVelocity(0, 0);
      this.playerTwo.play(`${this.playerTwoSprite}:right_face_idle`, true);
    }
  }
  declareWinner(winner, looser, side) {
    this.matchEnd = true;

    // Disable player input
    this.inputEnabled = false;
    this.matchStart = false; // Stop update loop

    // Stop all movements
    winner.setVelocity(0, 0);
    looser.setVelocity(0, 0);

    // Stop any running animations before playing new ones
    winner.anims.stop();
    looser.anims.stop();

    // Play winner animation and delay scene pause
    this.referee.play(`${side}_win`);
    winner.play(`${winner.texture.key}:front_taunt`);
    looser.play(`${looser.texture.key}:fall_down`);

    // Wait until animations complete before pausing the update loop
    winner.once("animationcomplete", () => {
      this.time.delayedCall(2000, () => {
        this.scene.pause();
      });
    });
  }
}
