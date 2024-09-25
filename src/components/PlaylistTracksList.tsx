import { fontSize } from '@/constants/tokens'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTracksListId } from '@/helpers/various'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { useMemo } from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import { QueueControls } from './QueueControls'
import { TracksList } from './TracksList'

export const PlaylistTracksList = ({ playlist }: { playlist: Playlist }) => {
	const search = useNavigationSearch({
		searchBarOptions: {
			hideWhenScrolling: true,
			placeholder: 'Procure em playlists!',
		},
	})

	const filteredPlaylistTracks = useMemo(() => {
		return playlist.tracks.filter(trackTitleFilter(search))
	}, [playlist.tracks, search])

	return (
		<View style={styles.container}>
			<View style={styles.playlistHeaderContainer}>
				<View style={styles.artworkImageContainer}>
					<FastImage
						source={{
							uri: playlist.artworkPreview,
							priority: FastImage.priority.high,
						}}
						style={styles.artworkImage}
					/>
					<Image
						source={{ uri: 'https://preview.redd.it/a-few-cover-artworks-for-jazz-playlists-v0-lbhar6wd24ec1.png?width=1024&format=png&auto=webp&s=92661df1fa83302cf17886ec404ed452a9dd7eb8' }} // URL da nova imagem
						style={styles.additionalImage} 
					/>
				</View>

				<Text numberOfLines={1} style={styles.playlistNameText}>
					{playlist.name}
				</Text>

				{search.length === 0 && (
					<QueueControls style={{ paddingTop: 24 }} tracks={playlist.tracks} />
				)}
			</View>

			<TracksList
				id={generateTracksListId(playlist.name, search)}
				scrollEnabled={false}
				hideQueueControls={true}
				tracks={filteredPlaylistTracks}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	playlistHeaderContainer: {
		marginBottom: 32,
	},
	artworkImageContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		height: 300,
		alignItems: 'center', 
	},
	artworkImage: {
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 12,
	},
	additionalImage: {
		width: 300, 
		height: 265, 
		borderRadius: 10,
		marginLeft: 10,
	},
	playlistNameText: {
		...defaultStyles.text,
		marginTop: 22,
		textAlign: 'center',
		fontSize: fontSize.lg,
		fontWeight: '800',
	},
})
