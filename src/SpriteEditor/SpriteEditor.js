import React, {useState} from 'react'
import {connect} from 'react-redux'
import Dialog from '@material-ui/core/Dialog';
import Tile from './Tile.js'
import {TILE_SIZE} from '../Game/constants.js';
import './SpriteEditor.scss';

const imageNames = ['tile0', 'tile1', 'tile2', 'tile3']

const SpritePicker = ({tileSets, selectedTileSet, onSelect})=> (
  <div className='image-list'>
    {tileSets.map((_, index)=>{
      return (
        <div
          className={`image ${index === selectedTileSet && 'selected'}`}
          onClick={()=> onSelect(index)}
        ></div>
      )
    })}
  </div>
)

const Preview = ({tiles, selectedTile, onSelect})=> (
  <div className='preview'>
    {tiles.map((rowArr, row)=> (
      rowArr.map((tileIndex, col)=> (
        <Tile
          img={imageNames[tileIndex]}
          x={col * TILE_SIZE}
          y={row * TILE_SIZE}
          onClick={()=> onSelect(row, col, selectedTile)}
        />
      ))
    ))}
  </div>
)

const TilePicker = ({selectedTile, onSelect})=> (
  <div className='picker'>
    {imageNames.map((name, index)=> (
      <img
        key={name}
        alt=''
        className={index === selectedTile ? 'selected' : ''}
        src={require(`../Game/images/tiles/${name}.png`)}
        onClick={()=> onSelect(index)}
      />
    ))}
  </div>
)

const SpriteEditor = ({tileSets, imageMap, images, open, updateTileSets, onClose})=> {  
  const [selectedTileSet, setSelectedTileSet] = useState(0);
  const [selectedTile, setSelectedTile] = useState(0);
  const tiles = tileSets[selectedTileSet]

  return (
    <Dialog open={open} onClose={onClose}>
      <div className='container'>
        <div className='left'>
          <SpritePicker
            tileSets={tileSets}
            selectedTileSet={selectedTileSet}
            onSelect={setSelectedTileSet}
          />
        </div>
        <div className='right'>
          <Preview
            tiles={tiles}
            selectedTile={selectedTile}
            onSelect={(row, col, newTileIndex)=> {
              const newTileSets = [...tileSets]
              newTileSets[selectedTileSet][row][col] = newTileIndex
              updateTileSets(newTileSets)
            }}
          />
          <TilePicker
            selectedTile={selectedTile}
            onSelect={setSelectedTile}
          />
        </div>
      </div>
    </Dialog>
  )
}

const mapStateToProps = ({game, spriteEditor})=> ({
  open: spriteEditor.open,
  imageMap: game.imageMap,
  images: game.images,
  tileSets: spriteEditor.tileSets
})

const mapDispatchToProps = (dispatch)=> ({
  updateTileSets: (tileSets)=> {
    dispatch({
      type: 'spriteEditor/UPDATE_TILESETS',
      tileSets,
    })
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SpriteEditor)
