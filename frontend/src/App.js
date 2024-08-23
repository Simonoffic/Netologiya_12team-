import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Table, message } from 'antd';
import axios from 'axios';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const { Header, Content } = Layout;

const columnsMovies = (handleSelectMovie, selectedMovies) => [
  {
    title: 'Название',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Год',
    dataIndex: 'year',
    key: 'year',
  },
  {
    title: 'Жанры',
    dataIndex: 'genres',
    key: 'genres',
    render: (genres) => genres.join(', '),
  },
  {
    title: 'Рейтинг',
    dataIndex: 'rating',
    key: 'rating',
  },
  {
    title: 'Действие',
    key: 'action',
    render: (text, record) => (
      <Button
        type="link"
        onClick={() => handleSelectMovie(record.id)}
        icon={
          selectedMovies.includes(record.id) ? (
            <HeartFilled style={{ color: 'red' }} />
          ) : (
            <HeartOutlined />
          )
        }
      />
    ),
  },
];

const columnsSelectedMovies = (handleUnselectMovie) => [
  {
    title: 'Название',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Год',
    dataIndex: 'year',
    key: 'year',
  },
  {
    title: 'Жанры',
    dataIndex: 'genres',
    key: 'genres',
    render: (genres) => genres.join(', '),
  },
  {
    title: 'Рейтинг',
    dataIndex: 'rating',
    key: 'rating',
  },
  {
    title: 'Действие',
    key: 'action',
    render: (text, record) => (
      <Button type="link" danger onClick={() => handleUnselectMovie(record.id)}>
        Удалить
      </Button>
    ),
  },
];

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentTab, setCurrentTab] = useState('1');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchMovies();
    fetchSelectedMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovies(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке фильмов');
    }
  };

  const fetchSelectedMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/selected');
      setSelectedMovies(response.data.map((movie) => movie.id));
    } catch (error) {
      message.error('Ошибка при загрузке избранных фильмов');
    }
  };

  // const fetchRecommendation = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:5000/api/recommend');
  //     setRecommendation(response.data);
  //   } catch (error) {
  //     message.error('Ошибка при загрузке рекомендации');
  //   }
  // };

  const handleSelectMovie = async (movieId) => {
    try {
      await axios.post('http://localhost:5000/api/select', { movieId });
      message.success('Фильм добавлен в избранное');
      fetchSelectedMovies();
    } catch (error) {
      message.error('Ошибка при добавлении фильма в избранное');
    }
  };

  const handleUnselectMovie = async (movieId) => {
    try {
      await axios.delete(`http://localhost:5000/api/unselect/${movieId}`);
      message.success('Фильм удален из избранного');
      fetchSelectedMovies();
    } catch (error) {
      message.error('Ошибка при удалении фильма из избранного');
    }
  };

  const handleLike = async () => {
    if (recommendations[currentIndex]) {
      try {
        await axios.post('http://localhost:5000/api/interact', {
          movieId: recommendations[currentIndex].id,
          liked: true,
        });
        messageApi.open({ content: 'Фильм лайкнут', duration: 2 });
        handleNextRecommendation();
      } catch (error) {
        message.error('Ошибка при лайке фильма');
      }
    }
  };

  const handleSkip = async () => {
    if (recommendations[currentIndex]) {
      try {
        await axios.post('http://localhost:5000/api/interact', {
          movieId: recommendations[currentIndex].id,
          liked: false,
        });
        messageApi.open({ content: 'Фильм пропущен', duration: 2 });
        handleNextRecommendation();
      } catch (error) {
        message.error('Ошибка при пропуске фильма');
      }
    }
  };

  const handleResetInteractions = async () => {
    try {
      await axios.delete('http://localhost:5000/api/reset');
      message.success('Выборы пользователя обнулены');
    } catch (error) {
      message.error('Ошибка при обнулении данных');
    }
  };

  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/train_and_recommend'
      );
      setRecommendations(response.data);
      setCurrentIndex(0); // Сброс индекса на начало при новой загрузке
    } catch (error) {
      message.error('Ошибка при получении рекомендаций');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRecommendation = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchRecommendation(); // Если достигнут конец списка, запрашиваем новые рекомендации
    }
  };

  useEffect(() => {
    if (currentTab === '3') {
      fetchRecommendation();
    }
  }, [currentTab]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[currentTab]}
          onClick={(e) => setCurrentTab(e.key)}
        >
          <Menu.Item key="1">Все фильмы</Menu.Item>
          <Menu.Item key="2">Избранные фильмы</Menu.Item>
          <Menu.Item key="3">Рекомендации</Menu.Item>
          <Menu.Item key="4">Главная</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '20px' }}>
        {currentTab === '1' && (
          <Table
            dataSource={movies}
            columns={columnsMovies(handleSelectMovie, selectedMovies)}
            rowKey="id"
          />
        )}
        {currentTab === '2' && (
          <Table
            dataSource={movies.filter((movie) =>
              selectedMovies.includes(movie.id)
            )}
            columns={columnsSelectedMovies(handleUnselectMovie)}
            rowKey="id"
          />
        )}
        <>
          {loading ? (
            <p>Подождите, модель обучается...</p>
          ) : (
            currentTab === '3' &&
            recommendations.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <h2>{recommendations[currentIndex].title}</h2>
                <p>{`Год: ${recommendations[currentIndex].year}, Жанры: ${
                  Array.isArray(recommendations[currentIndex].genres)
                    ? recommendations[currentIndex].genres.join(', ')
                    : 'Нет данных'
                }, Рейтинг: ${recommendations[currentIndex].rating}`}</p>
                <Button
                  type="primary"
                  onClick={handleLike}
                  style={{ marginRight: '10px' }}
                >
                  Лайк
                </Button>
                <Button onClick={handleSkip}>Пропустить</Button>
              </div>
            )
          )}
        </>
        {currentTab === '4' && (
          <div style={{ textAlign: 'center' }}>
            <h1>
              Сайт разработан командой номер 12 на хакатоне «Цифровые технологии
              анализа данных»
            </h1>
            <Button type="primary" onClick={handleResetInteractions}>
              Обнулить данные
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
}

export default App;
