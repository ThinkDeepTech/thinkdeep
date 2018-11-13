import os
import tarfile
from six.moves import urllib
import pandas as pd

DOWNLOAD_ROOT = "https://raw.githubusercontent.com/ageron/handson-ml/master/"
HOUSING_PATH = os.path.join("data")
HOUSING_URL = DOWNLOAD_ROOT + "datasets/housing/housing.tgz"

def fetch_data(url=HOUSING_URL, path=HOUSING_PATH, filename="housing.tgz"):
    if not os.path.isdir(path):
        os.makedirs(path)

    file_path = os.path.join(path, filename)
    urllib.request.urlretrieve(url, file_path)
    with tarfile.open(file_path) as archive:
        archive.extractall(path=path)

def load_data(path=HOUSING_PATH, filename="housing", extension="csv"):
    file_path = os.path.join(path, filename + "." + extension)
    return pd.read_csv(file_path)