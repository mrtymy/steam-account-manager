import React from 'react';
const GameCard = ({ game, accounts = [], activeAccount, handleSteamLogin }) => {
    const sortedAccounts = accounts
      .filter((acc) => acc.game_id === game.id)
      .sort((a, b) => b.status - a.status);
  
    return (
      <div className="card">
        <h2 className="game-title">{game.game_name}</h2>
        <img src={game.game_image} alt={game.game_name} className="game-image" />
        <div className="accounts">
          <ul className="account-list">
            {sortedAccounts.map((acc) => (
              <li key={acc.id}>
                <span className="account-name">{acc.username}</span>
                <span
                  className={`status ${acc.status === 1 ? 'online' : 'offline'}`}
                >
                  {acc.status === 1 ? 'Online' : 'Offline'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

export default GameCard;
