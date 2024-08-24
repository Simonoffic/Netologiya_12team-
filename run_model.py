import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import json
import io

def main(user_data, all_movies):
    genresList = ['Horror', 'Romance', 'Crime', 'Animation', 'Mystery', 'Children', 'Sci-Fi',
                  'Adventure', 'Musical', 'Drama', 'Action', 'IMAX', 'Fantasy', 'Film-Noir',
                  '(no genres listed)', 'War', 'Documentary', 'Western', 'Thriller', 'Comedy']

    labelencoder = LabelEncoder()
    coded_genres = labelencoder.fit_transform(genresList)
    genre2code = dict(zip(labelencoder.classes_, coded_genres))

    maxYear = 2019
    dataset = []

    for movie in user_data:
        params_of_film = [0] * 22
        GENRES = movie['genres']
        for el in genresList:
            if el in GENRES and el != '(no genres listed)':
                params_of_film[genre2code[el]] = 1
        params_of_film[20] = float("{:0.4f}".format(float(movie['rating'])/5))
        params_of_film[genre2code['(no genres listed)']] = float(int(movie['year'])/maxYear)
        params_of_film[21] = movie['liked']
        dataset.append(params_of_film)

    df_forLearn = pd.DataFrame(dataset).dropna()
    train_values = df_forLearn[21]
    train_points = df_forLearn.drop([21], axis=1)

    rfc = RandomForestClassifier()
    rfc.fit(train_points, train_values)

    dataset = []
    for movie in all_movies:
        params_of_film = [0] * 22
        GENRES = movie['genres']
        for el in genresList:
            if el in GENRES and el != '(no genres listed)':
                params_of_film[genre2code[el]] = 1
        params_of_film[20] = float("{:0.4f}".format(float(movie['rating'])/5))
        params_of_film[genre2code['(no genres listed)']] = float(int(movie['year'])/maxYear)
        params_of_film[21] = movie['title']
        dataset.append(params_of_film)

    df_forPredict = pd.DataFrame(dataset).dropna()
    pointsForPredict = df_forPredict.drop([21], axis=1)

    predictedValues = rfc.predict(pointsForPredict)

    titles = []
    count = 0
    t1 = 0
    for value in predictedValues:
        if count != 10 and value == 1:
            titles.append(df_forPredict[21][t1])
            count += 1
        t1 += 1

    filmsForShow = [movie for movie in all_movies if movie['title'] in titles]

    print(json.dumps(filmsForShow))

if __name__ == "__main__":
    f = io.open(sys.argv[1], mode="r", encoding="utf-8")
    user_data = json.loads(f.read())

    f = io.open(sys.argv[2], mode="r", encoding="utf-8")
    all_movies = json.loads(f.read())

    print()

    main(user_data, all_movies)
