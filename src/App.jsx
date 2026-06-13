import { useGameStore } from './store/gameStore';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="w-full overflow-hidden star-bg" style={{ height: '100%' }}>
      {screen === 'menu'     && <MenuScreen />}
      {screen === 'game'     && <GameScreen />}
      {screen === 'gameover' && <GameOverScreen />}
    </div>
  );
}
