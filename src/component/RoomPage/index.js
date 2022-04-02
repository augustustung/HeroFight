import React, { useEffect } from 'react'

function RoomPage({ client, user }) {
  useEffect(() => {
    if (!client) return

    client.on('player_join', (roomData) => {
      console.log(roomData);
    })

    return () => {
      client.off('new_room_created')
    }
  }, [client])

  return (
    <div>RoomPage</div>
  )
}

export default RoomPage