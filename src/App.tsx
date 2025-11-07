
import AppNavigation from './navigation/Navigation'
import { Provider } from 'react-redux'
import store from './redux/store'

function App() {

  return (
    <Provider store={store}>
        <div className="main-page-wrapper">
          <AppNavigation />
        </div>
    </Provider>
  )
}

export default App
