import Database from './utils/DB';
import Distributor from './distributor/Distributor';

Database.getPool();
const distributor = new Distributor();
