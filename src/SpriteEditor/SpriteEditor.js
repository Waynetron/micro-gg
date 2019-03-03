import React, {useState} from 'react'
import {connect} from 'react-redux'
import Dialog from '@material-ui/core/Dialog';
import Tile from './Tile.js'
import {TILE_SIZE} from '../Game/constants.js';
import './SpriteEditor.scss';

const SpritePicker = ({images, tileSets, selectedTileSet, onSelect})=> (
  <div className='image-list'>
    {images.map((src, index)=>{
      return (
        <img
          src={src}
          alt=''
          className={`image ${index === selectedTileSet && 'selected'}`}
          onClick={()=> onSelect(index)}
        />
      )
    })}
  </div>
)

const Preview = ({tiles, selectedTile, tileImages, onSelect})=> (
  <div className='preview'>
    {tiles.map((rowArr, row)=> (
      rowArr.map((tileIndex, col)=> (
        <Tile
          img={tileImages[tileIndex]}
          x={col * TILE_SIZE}
          y={row * TILE_SIZE}
          onClick={()=> onSelect(row, col, selectedTile)}
        />
      ))
    ))}
  </div>
)

const TilePicker = ({selectedTile, tileImages, onSelect})=> (
  <div className='picker'>
    {tileImages.map((name, index)=> (
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

const SpriteEditor = ({tileSets, tileImages, images, open, updateTileSets, onClose})=> {  
  const [selectedTileSet, setSelectedTileSet] = useState(0);
  const [selectedTile, setSelectedTile] = useState(0);
  const tiles = tileSets[selectedTileSet]

  return (
    <Dialog open={open} onClose={onClose}>
      <div className='container'>
        <div className='left'>
          <SpritePicker
            images={images}
            tileSets={tileSets}
            selectedTileSet={selectedTileSet}
            onSelect={setSelectedTileSet}
          />
        </div>
        <div className='right'>
          <Preview
            tiles={tiles}
            tileImages={tileImages}
            selectedTile={selectedTile}
            onSelect={(row, col, newTileIndex)=> {
              const newTileSets = [...tileSets]
              newTileSets[selectedTileSet][row][col] = newTileIndex
              updateTileSets(newTileSets)
            }}
          />
          <TilePicker
            tileImages={tileImages}
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
  tileImages: spriteEditor.tileImages,
  images: spriteEditor.images,
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
