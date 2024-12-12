from database.queries import *
from database.connection import *

# con_params = ("localhost", "estudante1", "estudante1", "athleteconnect")   
con_params = ("localhost", "root", "1234", "athleteconnect")   
# con_params = ("localhost", "troarmen", "0000", "athleteconnect") 

def main():
    con = open_connection(*con_params)
    create_database(con)
    close_connection(con)

    con = open_connection(*con_params)
    seed_data(con)
    close_connection(con)

if __name__ == '__main__':
    main()