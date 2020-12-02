import React, {useState, useEffect} from 'react';
import axios from 'axios';

import {Header, Loader, Tips, Searchbar} from './components';

const baseUrl = 'https://en.wikipedia.org/w/api.php';

export interface Tip {
  pageid: number,
  title: string,
}

export interface ActiveTip {
  tip: Tip | null,
  data: any,
  loading: boolean
}

function App() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tips, setTips] = useState<Tip[]>([]);
  const [activeTip, setActiveTip] = useState<ActiveTip>({
    tip: null,
    data: '',
    loading: false,
  });
  
  useEffect(() => {
    if (!search) {
      setActiveTip(prevState => ({tip: null, data: '', loading: false}))
      return setTips([]);
    }
    setLoading(true);
    axios.get(`${baseUrl}?origin=*&action=query&list=search&format=json&srsearch=${search}`)
      .then(({data}) => setTips(() => data.query.search.map((item: Tip) => ({pageid: item.pageid, title: item.title}))))
      .catch(error => setError(error))
      .finally(() => setLoading(false))
  }, [search, setSearch]);
  
  useEffect(() => {
    if (!activeTip.tip) return;
    setActiveTip(prevState => ({...prevState, loading: true}))
    axios.get(`${baseUrl}?origin=*&page=${activeTip.tip.title}&action=parse&format=json`)
      .then(({data}) => setActiveTip(prevState => ({...prevState, data: data.parse})))
      .catch(error => setError(error))
      .finally(() => setActiveTip(prevState => ({...prevState, loading: false})))
  }, [activeTip.tip, setActiveTip]);
  
  return (
    <>
      <Header />
      <main>
        <Searchbar
          search={search}
          setSearch={setSearch}
        />
        {error && <h1>Error occurred!</h1>}
        {loading && <Loader />}
        {!loading && tips.length > 0 && (
          <Tips
            tips={tips}
            activeTip={activeTip.tip}
            setActiveTip={setActiveTip}
          />)
        }
        {activeTip.tip && activeTip.loading && <Loader />}
        {activeTip.tip && !activeTip.loading && activeTip.data && (
          <div
            className="container mt-4"
            dangerouslySetInnerHTML={{__html: activeTip.data.text['*']}}
          />
        )}
      </main>
    </>
  );
}

export default App;
