import { useFavorites } from '@/store/library'
import { useQueue } from '@/store/queue'
import { MenuView } from '@react-native-menu/menu'
import { useRouter } from 'expo-router'
import { PropsWithChildren } from 'react'
import TrackPlayer, { Track } from 'react-native-track-player'
import { match } from 'ts-pattern'

type TrackShortMenuProps = PropsWithChildren<{ track: Track }>

export const TrackShortcutsMenu = ({ track, children }: TrackShortMenuProps) => {
	const router = useRouter()
	const isFavorite = track.rating === 1

	const { toggleTrackFavorite } = useFavorites()
	const { activeQueueId } = useQueue()

	const handlePressAction = async (id: string) => {
		await match(id)
			.with('add-to-favorites', () => {
				toggleTrackFavorite(track)

				if (activeQueueId?.startsWith('favoritos')) {
					return TrackPlayer.add(track)
				}
			})
			.with('remove-from-favorites', async () => {
				toggleTrackFavorite(track)

				if (activeQueueId?.startsWith('favoritos')) {
					const queue = await TrackPlayer.getQueue()
					const trackToRemove = queue.findIndex((queueTrack) => queueTrack.url === track.url)

					if (trackToRemove !== -1) {
						await TrackPlayer.remove(trackToRemove)
					}
				}
			})
			.with('add-to-playlist', () => {
				
				router.push({ pathname: '(modals)/addToPlaylist', params: { trackUrl: track.url } })
			})
			.with('remove-from-playlist', async () => {
				
				if (activeQueueId?.startsWith('playlist')) {
					const queue = await TrackPlayer.getQueue()
					const trackToRemove = queue.findIndex((queueTrack) => queueTrack.url === track.url)

					if (trackToRemove !== -1) {
						await TrackPlayer.remove(trackToRemove)
					}
				}
			})
			.otherwise(() => console.warn(`Ação do menu é desconhecida ${id}`))
	}

	return (
		<MenuView
			onPressAction={({ nativeEvent: { event } }) => handlePressAction(event)}
			actions={[
				{
					id: isFavorite ? 'remove-from-favorites' : 'add-to-favorites',
					title: isFavorite ? 'Remover de favoritos' : 'Adicionar aos favoritos',
					image: isFavorite ? 'star.fill' : 'star',
				},
				{
					id: 'add-to-playlist',
					title: 'Adicionar na playlist',
					image: 'plus',
				},
				{
					id: 'remove-from-playlist',
					title: 'Remover da playlist',
					image: 'minus',
				},
			]}
		>
			{children}
		</MenuView>
	)
}
