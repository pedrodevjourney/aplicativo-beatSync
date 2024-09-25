import { PlaylistsList } from '@/components/PlaylistsList'
import { screenPadding } from '@/constants/tokens'
import { playlistNameFilter } from '@/helpers/filter'
import { Playlist, Track } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { useMemo, useState, useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import { LogBox } from 'react-native';

const PlaylistsScreen = () => {
	const [playlists, setPlaylists] = useState<Playlist[]>([])
	const router = useRouter()
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Encontre suas playlists...',
		},
	})

	// Função para buscar as playlists(GET PLAYLISTS)
	async function fetchPlaylists() {
		try {
			const response = await fetch('http://10.0.0.244:8000/api/playlists')
			const body = await response.json()

			const playlistMusic: Playlist[] = body.map((item: Playlist) => ({
				id: item.id,
				name: item.name,
				tracks: [],
				artworkPreview: item.artworkPreview
			}))
			setPlaylists(playlistMusic)
		} catch (error) {
			console.error('Erro ao buscar playlists:', error)
		}
	}

	// Função para buscar as músicas de uma playlist específica(GET musicas dentro da playlist)
	async function fetchPlaylistTracks(playlistId: number): Promise<Track[]> {
		try {
			const response = await fetch(`http://10.0.0.244:8000/api/playlists/${playlistId}/songs`)
			const body = await response.json()

			const tracks: Track[] = body.map((item: Track) => ({
				id: item.id,
				url: item.url,
				title: item.title,
				album: item.album,
				artist: item.artist,
				duration: item.duration,
				artwork: item.artwork,
				description: item.description,
				genre: item.genre,
				date: item.date,
				rating: item.rating,
				isLiveStream: item.isLiveStream,
			}))

			return tracks
		} catch (error) {
			console.error('Erro ao buscar músicas da playlist:', error)
			return []
		}
	}

	useEffect(() => {
		fetchPlaylists()
	}, [])

	const filteredPlaylists = useMemo(() => {
		return playlists.filter(playlistNameFilter(search))
	}, [playlists, search])

	const handlePlaylistPress = async (playlist: Playlist) => {
		// Buscar músicas da playlist ao clicar
		const tracks = await fetchPlaylistTracks(playlist.id)

		// Atualizar a playlist com as músicas carregadas
		const updatedPlaylists = playlists.map((p) =>
			p.id === playlist.id ? { ...p, tracks } : p
		)
		setPlaylists(updatedPlaylists)

		router.push(`/(tabs)/playlists/${playlist.id}`)
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{
					paddingHorizontal: screenPadding.horizontal,
				}}
			>
				<PlaylistsList
					scrollEnabled={false}
					playlists={filteredPlaylists}
					onPlaylistPress={handlePlaylistPress}
				/>
			</ScrollView>
		</View>
	)
}

LogBox.ignoreLogs(['Ignorar Warning useLayoutEffect']); 
LogBox.ignoreAllLogs();

export default PlaylistsScreen
