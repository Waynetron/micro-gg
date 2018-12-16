import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  scene: {
      preload,
      create,
      update
  },
  parent: 'game'
};

var game = new Phaser.Game(config);

function preload() {}
function create() {}
function update() {}