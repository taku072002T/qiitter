import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {onAuthStateChanged,getAuth,GoogleAuthProvider,signInWithPopup} from 'firebase/auth'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
//Firebaseプロジェクト設定欄にあるものを貼り付けてください。
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const auth = getAuth();
const provider = new GoogleAuthProvider();



const ScoreBoard = () => {
  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [latestScoreGage, setLatestScoreGage] = useState(0);
  const [latestScoreCreated, setLatestScoreCreated] = useState(0);
  const [latestId, setLatestId] = useState(null);
  const [latestIndex, setLatestIndex] = useState(null);
  const [overflowedlatest, setflowerlatest] = useState('False');
  const [newScores,setnewScores] = useState([])



    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setnewScores(snapshot.docs.map((doc) => {
        const data = doc.data();
        let created_at;

        try {
          if (data.created_at) {
            const timestamp =
              typeof data.created_at === 'string'
                ? parseInt(data.created_at, 10)
                : data.created_at;

            if (timestamp.toString().length === 10) {
              created_at = new Date(timestamp * 1000);
            } else {
              created_at = new Date(timestamp);
            }
          } else {
            created_at = new Date();
          }
        } catch (error) {
          console.error('リクエストエラー', error);
          created_at = new Date();
        }

        return {
          docId: doc.id,
          ...data,
          created_at,
        };
      }));

      
      })
      onAuthStateChanged(auth,(user)=>{
        if (user){
          ()=>{unsubscribe();}
          setScores(newScores);
          if (newScores.length > 0) {
            setLatestScore(newScores[0]);
            setLatestScoreGage(newScores[0].score);
            setLatestId(newScores[0].id);
            setLatestScoreCreated(newScores[0].created_at);
            
            // Calculate the rank of the latest score
            const sortedScores = [...newScores].sort((a, b) => b.score - a.score);
            const latestRank = sortedScores.findIndex(score => score.id === newScores[0].id) + 1;
            setLatestIndex(latestRank);
            setflowerlatest(latestRank > 1000 ? 'True' : 'False');
          }
        }else{

        }
    
    });
  useEffect(() => {

  
    // Google認証ポップアップを表示
    signInWithPopup(auth, provider)
      .then((result) => {
        // 認証成功時の処理
  
        console.log('Google認証成功:', result.user.displayName);

      })
      .catch((error) => {
        // エラー時の処理
        
        console.error('Google認証エラー:', error);
      });
  }, []);

  const formatDate = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date)) {
        throw new Error('日付が間違っています');
      }

      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo',
      });
    } catch (error) {
      return '日付が不明です';
    }
  };

  const renderRankingItem = (score, index) => (
    <div
      key={score.docId}
      className={`ranking-item ${score.id === latestId ? 'first-place' : ''} ${index === 0 ? 'rank-1' : ''} ${index === 1 ? 'rank-2' : ''} ${index === 2 ? 'rank-3' : ''}`}
    >
      <span className={`rank ${index === 0 ? 'rank-first' : ''}`}>
        {index === 0 ? '👑' : `#${index + 1}`}
      </span>
      <span className={`score ${index === 0 ? 'score-first' : ''} ${index === 1 ? 'score-second' : ''} ${index === 2 ? 'score-third' : ''} ${index === 3 ? 'score-hutu' : ''} ${index === 4 ? 'score-hutu' : ''}`}>
        {score.score}
      </span>
      <span className="date">{formatDate(score.created_at)}</span>
    </div>
  );

  return (
    <div className="scoreboard">
      <div className="space-background"></div>
      <div className="content">
        <h1 className="title tit-yay">Congratulations.</h1>

        <div className="score-container">
          {latestScore && (
            <div className="latest-score">
              <h2>1st Score</h2>
              <div className="latest-score-value">{scores.sort((a, b) => b.score - a.score)[0].score}</div>
              <div className="latest-score-date">
                {formatDate(scores.sort((a, b) => b.score - a.score)[0].created_at)}
              </div>
              <a className='latest-score-value' style={{ fontSize: '20px' }}><br /><span className='pl1'>Player 1</span><br />{scores.sort((a, b) => b.score - a.score)[0].score1}<br /><br /><br /></a>
              <a className='latest-score-value' style={{ fontSize: '20px' }}><span className='pl2'>Player 2</span><br />{scores.sort((a, b) => b.score - a.score)[0].score2}<br /><br /><br /></a>
              <a className='latest-score-value' style={{ fontSize: '20px' }}><span className='pl3'>Player 3<br /></span>{scores.sort((a, b) => b.score - a.score)[0].score3}<br /><br /><br /></a>
              <a className='latest-score-value' style={{ fontSize: '20px' }}><span className='pl4'>Player 4<br /></span>{scores.sort((a, b) => b.score - a.score)[0].score4}<br /></a>
            </div>
          )}

          <div className="ranking-container">
            <h2 className='rankingno'>ランキング</h2>
            <div className="ranking-list">
              {scores
                .sort((a, b) => b.score - a.score)
                .slice(0, 1000)
                .map((score, index) => renderRankingItem(score, index))}
              {overflowedlatest === 'True' && (
                <>
                  <div className="ranking-ellipsis">...</div>
                  <div
                    className={`ranking-item first-place`}
                  >
                    <span className="rank">
                      <span className=' jorge'  style={{ fontSize: 'x-smaller' }}>LastScore</span><br/>
                      #{latestIndex}
                    </span>
                    <span className="score">
                      {latestScoreGage}
                    </span>
                    <span className="date">{formatDate(latestScoreCreated)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;

