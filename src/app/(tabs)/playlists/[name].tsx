import { fontSize, screenPadding } from '@/constants/tokens'
import { Playlist, Track } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import { PlaylistTracksList } from '@/components/PlaylistTracksList'
import { useLocalSearchParams } from 'expo-router'


export const PlaylistScreen = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { name: playlistName } = useLocalSearchParams<{ name: string }>()

  const fetchPlaylistData = async () => {
    try {
      setLoading(true)
      setError(null)

      const playlistResponse = await fetch(`http://192.168.2.168:8000/api/playlists?name=${playlistName}`)
      if (!playlistResponse.ok) {
        throw new Error('Erro ao buscar playlists!')
      }
      const playlistData = await playlistResponse.json()

      if (playlistData.length === 0) {
        throw new Error('Nenhuma playlist encontrada!')
      }

      const fetchedPlaylists = playlistData.slice(0, 3)

      const playlistsWithTracks = await Promise.all(
        fetchedPlaylists.map(async (playlist: { id: number; name: string }) => {
          const tracksResponse = await fetch(`http://192.168.2.168:8000/api/playlists/${playlist.id}/songs`)
          if (!tracksResponse.ok) {
            throw new Error(`Erro ao buscar músicas da playlist ${playlist.name}!`)
          }
          const tracksData = await tracksResponse.json()
          return { ...playlist, tracks: tracksData }
        })
      )

      setPlaylists(playlistsWithTracks)

    } catch (erro) {
      setError('Erro desconhecido...')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playlistName) {
      fetchPlaylistData()
    }
  }, [playlistName])

  if (!selectedPlaylist) {
    return (
      <View style={defaultStyles.container}>
        {playlists.map((playlist) => (
          <View key={playlist.id}>
            <TouchableOpacity style={styles.button} onPress={() => setSelectedPlaylist(playlist)}>
              <Text style={styles.buttonText}>{playlist.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={defaultStyles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ paddingHorizontal: screenPadding.horizontal }}>
        <PlaylistTracksList playlist={selectedPlaylist} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000', 
    padding: 12,               
    borderRadius: 5,           
    marginVertical: 5, 
            
  },
  buttonText: {
    color: '#FFFFFF',         
    textAlign: 'center',   
    fontSize: fontSize.base
  },
});

export default PlaylistScreen
