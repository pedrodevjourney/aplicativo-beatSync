import { TracksList } from '@/components/TracksList'
import { screenPadding } from '@/constants/tokens'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { View, ScrollView } from 'react-native'
import { useEffect, useState, useMemo } from 'react'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/various'
import { Track } from 'react-native-track-player'

const SongsScreen = () => {
	const [musics, setMusics] = useState<Track[]>([])
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'O que você quer ouvir?',
		},
	})

	// Função para recuperar as músicas da API
	async function fetchMusicas() {
		try {
			const response = await fetch('http://10.0.0.244:8000/api/songs')
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
			setMusics(tracks)
		} catch (error) {
			console.error('Erro ao buscar músicas:', error)
		}
	}

	// Chama fetchMusicas quando o componente é montado
	useEffect(() => {
		fetchMusicas()
	}, [])

	// Filtra as músicas com base na busca
	const filteredTracks = useMemo(() => {
		if (!search) return musics
		return musics.filter(trackTitleFilter(search))
	}, [search, musics])

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<TracksList
					id={generateTracksListId('songs', search)}
					tracks={filteredTracks}
					scrollEnabled={false}
				/>
			</ScrollView>
		</View>
	)
}

export default SongsScreen
