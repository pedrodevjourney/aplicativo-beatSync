import unknownArtistImage from '@/assets/artista-desconhecido.png'
import unknownTrackImage from '@/assets/musica-desconhecida.png'
import { Image } from 'react-native'

export const unknownTrackImageUri = Image.resolveAssetSource(unknownTrackImage).uri
export const unknownArtistImageUri = Image.resolveAssetSource(unknownArtistImage).uri
