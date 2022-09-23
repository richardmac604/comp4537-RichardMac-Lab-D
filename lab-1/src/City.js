import React from 'react'

function City(aCity) {
  const {description, name , temperature} = aCity

  return (
    <div>
        City {name} temp is {temperature} and the weather desciption is {description}
    </div>
  )
}

export default City