import { Event, useTrackPlayerEvents } from 'react-native-track-player'

const events = [Event.PlaybackState, Event.PlaybackError, Event.PlaybackActiveTrackChanged]

export const useLogTrackPlayerState = () => {
	useTrackPlayerEvents(events, async (event) => {
		if (event.type === Event.PlaybackError) {
			console.warn('Um erro ocorreu: ', event)
		}

		if (event.type === Event.PlaybackState) {
			console.log('Estado de reprodução: ', event.state)
		}

		if (event.type === Event.PlaybackActiveTrackChanged) {
			console.log('Trilha trocada', event.index)
		}
	})
}