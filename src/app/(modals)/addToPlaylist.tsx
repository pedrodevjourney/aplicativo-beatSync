import { PlaylistsList } from '@/components/PlaylistsList'
import { screenPadding } from '@/constants/tokens'
import { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { defaultStyles } from '@/styles'
import { useHeaderHeight } from '@react-navigation/elements'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TrackPlayer, { Track } from 'react-native-track-player'


const AddToPlaylistModal = () => {
	const router = useRouter()
	const headerHeight = useHeaderHeight()

	const { activeQueueId } = useQueue()
	const { trackUrl } = useLocalSearchParams<{ trackUrl: Track['url'] }>()
	const tracks = useTracks()

	const [playlists, setPlaylists] = useState<Playlist[]>([])
	const [songs, setSongs] = useState<Track[]>([]) // Estado para armazenar músicas da API laravel

	// Função para buscar músicas válidas da API(GET songs)
	const fetchSongs = async () => {
		try {
			const response = await fetch('http://192.168.2.168:8000/api/songs')
			const data = await response.json()

			const validSongs = data.map((song: any) => ({
				id: song.id,
				url: song.url,
				title: song.title,
				artwork: song.artwork
			}))

			setSongs(validSongs)
		} catch (error) {
			console.error('Erro ao buscar músicas:', error)
		}
	}

	// Busca a música correta com base na URL
	const track = songs.find((currentSong) => trackUrl === currentSong.url)

	//(GET playlists)
	const fetchPlaylists = async () => {
		try {
			const response = await fetch('http://192.168.2.168:8000/api/playlists')
			const data = await response.json()

			const playlistMusica: Playlist[] = data.map((item: any) => ({
				id: item.id,
				name: item.name,
				tracks: item.tracks || [],
				artworkPreview: item.artworkPreview,
			}))

			setPlaylists(playlistMusica)
		} catch (error) {
			console.error('Erro ao buscar playlists:', error)
		}
	}

	// Função para adicionar música a uma playlist via API(POST)
	const addSongToPlaylist = async (playlistId: number, track: Track) => {
		if (!track || !track.id) {
			console.error('A música não possui um ID válido!')
			return
		}

		try {
			const response = await fetch(`http://192.168.2.168:8000/api/playlists/${playlistId}/songs`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					song_id: track.id,
				}),
			})

			if (!response.ok) {
				throw new Error('Erro ao adicionar a música à playlist!')
			}

			console.log(`Música ${track.id} foi adicionada à playlist: ${playlistId} com sucesso!`)
		} catch (error) {
			console.error('Erro ao adicionar a música à playlist: ', error)
		}
	}

	const removeSongToPlaylist = async (playlistId: number, track: Track) => {
		if (!track || !track.id) {
			console.error('A música não possui um ID válido!')
			return
		}

		try {
			const response = await fetch(`http://192.168.2.168:8000/api/playlists/${playlistId}/songs`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					song_id: track.id,
				}),
			})

			if (!response.ok) {
				throw new Error('Erro ao remover a música à playlist!')
			}

			console.log(`Música ${track.id} foi removida da playlist: ${playlistId} com sucesso!`)
		} catch (error) {
			console.error('Erro ao remover a música à playlist!')
		}
	}

	// Efeito para carregar as músicas e playlists ao montar o componente
	useEffect(() => {
		fetchSongs()
		fetchPlaylists()
	}, [])

	// Verifica se a track existe
	if (!track) {
		return null
	}

	// Filtra as playlists que ainda não contêm a música atual
	const availablePlaylists = playlists.filter(
		(playlist) =>
			playlist.tracks && !playlist.tracks.some((playlistTrack) => playlistTrack.url === track.url),
	)

	// Função para tratar a seleção de uma playlist
	const handlePlaylistPress = async (playlist: Playlist) => {
		await addSongToPlaylist(playlist.id, track)

		router.dismiss()

		if (activeQueueId?.startsWith(playlist.name)) {
			await TrackPlayer.add(track)
		}
	}

	return (
		<SafeAreaView style={[styles.modalContainer, { paddingTop: headerHeight }]}>
			<PlaylistsList playlists={availablePlaylists} onPlaylistPress={handlePlaylistPress} />
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		...defaultStyles.container,
		paddingHorizontal: screenPadding.horizontal,
	},
})

export default AddToPlaylistModal
