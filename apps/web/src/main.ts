import './styles.css';

void import('./game/bootstrap')
  .then(({ bootstrapGame }) => {
    bootstrapGame();
  })
  .catch((error: unknown) => {
    console.error('Failed to bootstrap game runtime', error);
  });
