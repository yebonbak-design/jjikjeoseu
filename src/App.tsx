import { StoreProvider, useStore } from './store'
import { AlbumPage } from './pages/AlbumPage'
import { BagPage } from './pages/BagPage'
import { EditorPage } from './pages/EditorPage'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { Shell } from './components/Shell'

function Screen() {
  const { route } = useStore()
  if (route.page === 'album') return <AlbumPage />
  if (route.page === 'editor') return <EditorPage />
  if (route.page === 'shop') return <ShopPage />
  if (route.page === 'bag') return <BagPage />
  return <HomePage />
}

export default function App() {
  return (
    <StoreProvider>
      <Shell>
        <Screen />
      </Shell>
    </StoreProvider>
  )
}
