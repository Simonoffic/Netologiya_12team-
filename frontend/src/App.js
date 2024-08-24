import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Table, message, Modal } from "antd";
import axios from "axios";
import { PlayCircleOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

const columnsMovies = (handleWatchMovie) => [
  {
    title: "Название",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Год",
    dataIndex: "year",
    key: "year",
  },
  {
    title: "Жанры",
    dataIndex: "genres",
    key: "genres",
    render: (genres) => genres.join(", "),
  },
  {
    title: "Рейтинг",
    dataIndex: "rating",
    key: "rating",
  },
  {
    title: "Смотреть",
    key: "action",
    render: (value, record, index) => (
      <Button
        type="link"
        onClick={() => handleWatchMovie(record)}
        icon={
          <PlayCircleOutlined
            style={{
              color:
                record.liked === null || record.liked === undefined
                  ? "gray"
                  : record.liked
                  ? "green"
                  : "red",
            }}
          />
        }
      />
    ),
  },
];

const columnsSelectedMovies = () => [
  {
    title: "Название",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Год",
    dataIndex: "year",
    key: "year",
  },
  {
    title: "Жанры",
    dataIndex: "genres",
    key: "genres",
    render: (genres) => genres.join(", "),
  },
  {
    title: "Рейтинг",
    dataIndex: "rating",
    key: "rating",
  },
  {
    title: "Статус",
    key: "liked",
    render: (text, record) =>
      record.liked ? "Просмотрен + понравился" : "Просмотрен",
  },
];

function App() {
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [currentTab, setCurrentTab] = useState("1");
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/movies");
      setMovies(response.data);
    } catch (error) {
      message.error("Ошибка при загрузке фильмов");
    }
  };

  const handleWatchMovie = (movie) => {
    setCurrentMovie(movie);
  };

  const handleWatchMovieOk = async (movie) => {
    setCurrentMovie(null);
    try {
      await axios.post("http://localhost:5000/api/interact", {
        movieId: movie.id,
        liked: true,
      });
      // optimistic
      setMovies((prev) =>
        prev.map((x) => (x.id === movie.id ? { ...x, liked: true } : x))
      );
      setRecommendations((prev) =>
        prev.map((x) => (x.id === movie.id ? { ...x, liked: true } : x))
      );
      messageApi.open({ content: "Фильм посмотрен и понравился", duration: 2 });
    } catch (error) {
      message.error("Ошибка просмотра фильма");
    }
  };

  const handleWatchMovieCancel = async (movie) => {
    setCurrentMovie(null);
    try {
      await axios.post("http://localhost:5000/api/interact", {
        movieId: movie.id,
        liked: false,
      });
      // optimistic
      setMovies((prev) =>
        prev.map((x) => (x.id === movie.id ? { ...x, liked: false } : x))
      );
      console.log(recommendations, movie);
      setRecommendations((prev) =>
        prev.map((x) => (x.id === movie.id ? { ...x, liked: false } : x))
      );
      messageApi.open({ content: "Фильм посмотрен", duration: 2 });
    } catch (error) {
      message.error("Ошибка просмотра фильма");
    }
  };

  const handleResetInteractions = async () => {
    try {
      await axios.delete("http://localhost:5000/api/reset");
      await fetchMovies();
      message.success("Выборы пользователя обнулены");
    } catch (error) {
      message.error("Ошибка при обнулении данных");
    }
  };

  const [loading, setLoading] = useState(false);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/train_and_recommend"
      );
      setRecommendations(response.data);
    } catch (error) {
      message.error("Ошибка при получении рекомендаций");
    } finally {
      setLoading(false);
    }
  };
  const watchedMovies = movies.filter((x) => x.liked !== null);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      <Modal
        title={currentMovie?.title ?? ""}
        open={currentMovie !== null}
        onOk={() => handleWatchMovieOk(currentMovie)}
        onCancel={() => handleWatchMovieCancel(currentMovie)}
        okText="Понравилось"
        cancelText="Закрыть"
      >
        {currentMovie && (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p>Год</p>
              <p>Рейтинг</p>
              <p>Жанры</p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                alignItems: "end",
              }}
            >
              <p>{currentMovie.year}</p>
              <p>{currentMovie.rating}</p>
              <p>{currentMovie.genres}</p>
            </div>
          </div>
        )}
      </Modal>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[currentTab]}
          onClick={(e) => {
            setCurrentTab(e.key);
            if (e.key === "3") {
              fetchRecommendation();
            }
          }}
        >
          <Menu.Item key="1">Все фильмы</Menu.Item>
          <Menu.Item key="2">Просмотренные фильмы</Menu.Item>
          <Menu.Item key="3">Рекомендации</Menu.Item>
          <Menu.Item key="4">Главная</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "20px" }}>
        {currentTab === "1" && (
          <Table
            dataSource={movies}
            columns={columnsMovies(handleWatchMovie)}
            rowKey="id"
          />
        )}
        {currentTab === "2" && (
          <Table
            dataSource={watchedMovies}
            columns={columnsSelectedMovies()}
            rowKey="id"
          />
        )}
        {currentTab === "3" &&
          (loading ? (
            <p>Получение рекомендаций от модели...</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <p>
                Вы просмотрели {watchedMovies.length} фильмов.{" "}
                {watchedMovies.length < 5 &&
                  "Для получения рекомендаций на основе Ваших предпочтений посмотрите более 5 фильмов."}
              </p>
              <Table
                dataSource={recommendations}
                columns={columnsMovies(handleWatchMovie)}
                rowKey="id"
              />
            </div>
          ))}
        {currentTab === "4" && (
          <div style={{ textAlign: "center" }}>
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
