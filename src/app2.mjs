import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { API_BASE_URL } from '../config.js'; 
import './styles.scss';  
function App() {
    const [games, setGames] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAccount, setActiveAccount] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchData(token);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                fetchData(data.token);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Login hatası: ' + error.message);
        }
    };

    const fetchData = async (token) => {
        try {
            if (!token) {
                token = localStorage.getItem('token');
            }
            if (!token) {
                throw new Error('User not logged in');
            }

            const response = await fetch(`${API_BASE_URL}?action=getGamesAndAccounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setGames(data.games);
            setAccounts(data.accounts);

            const activeAcc = data.accounts ? data.accounts.find(acc => acc.status === 1) : null;
            if (activeAcc) {
                setActiveAccount(activeAcc.username);
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSteamLogin = async (username, password) => {
        window.electronAPI.launchSteam(username, password);
        try {
            const response = await fetch(`${API_BASE_URL}?action=updateAccountStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: new URLSearchParams({ username, status: "1" })
            });

            const data = await response.json();
            if (data.success) {
                fetchData(); 
            } else {
                console.error('Account status update failed:', data.error);
            }
        } catch (error) {
            console.error('Error updating account status:', error);
        }
    };

    const handleSteamLogout = async () => {
        if (activeAccount) {
            try {
                const response = await fetch(`${API_BASE_URL}?action=updateAccountStatus`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username: activeAccount, status: 0 })
                });

                const data = await response.json();
                if (data.success) {
                    window.electronAPI.killSteam();
                    setActiveAccount(null);
                    setAccounts(accounts.map(acc => 
                        acc.username === activeAccount ? { ...acc, status: 0 } : acc
                    ));
                } else {
                    console.error('DB durumu güncellenemedi:', data.error);
                }
            } catch (error) {
                console.error('Logout hatası:', error);
            }
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container mt-5">
                <h2>Login to Steam Account Manager</h2>
                {error && <p className="alert alert-danger">{error}</p>}
                <div className="mb-3">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-3">
                    <label>Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>
                <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h1>Steam Account Manager</h1>
            {error && <p className="alert alert-danger">{error}</p>}
            
            {activeAccount && (
                <button className="btn btn-danger mb-3" onClick={handleSteamLogout}>
                    Hesaptan Çık
                </button>
            )}

            {isLoading ? (
                <p>Loading games...</p>
            ) : (
                <div className="row">
                    {games.length > 0 ? (
                        games.map(game => (
                            <GameCard 
                                key={game.id} 
                                game={game} 
                                accounts={accounts} 
                                activeAccount={activeAccount} 
                                handleSteamLogin={handleSteamLogin}
                            />
                        ))
                    ) : (
                        <p>No games found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

const GameCard = ({ game, accounts = [], activeAccount, handleSteamLogin }) => {
    // Online hesapları önce göstermek için sıralama
    const sortedAccounts = accounts
        .filter(acc => acc.game_id === game.id)
        .sort((a, b) => b.status - a.status); // Online hesaplar önce

    // Sadece ilk 2 hesabı göstermek için kısaltma
    const limitedAccounts = sortedAccounts.slice(0, 2);

    return (
        <div className="col-md-4 game-card">
        <div className="card mb-4 shadow-sm">
            <img src={game.game_image} className="card-img-top" alt={game.game_name} />
            <div className="card-body">
                <h5 className="card-title">{game.game_name}</h5>
                <p className="card-text">Available Accounts:</p>
                <ul className="account-list">
                    {sortedAccounts.map((acc) => (
                        <li key={acc.id}>
                            <button className={`btn btn-sm account-btn ${acc.status === 1 ? 'btn-success' : 'btn-warning'}`}>
                                {acc.username}
                            </button>
                            <span className={`badge ${acc.status === 1 ? 'bg-success' : 'bg-warning'}`}>
                                {acc.status === 1 ? 'Online' : 'Offline'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
    
    );
};

// React 18 API'si ile kök oluşturun ve bileşeni render edin
const rootElement = document.getElementById('app');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
