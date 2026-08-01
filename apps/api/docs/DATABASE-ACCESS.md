# Database Access Standard

## One supported path

```text
Controller
  → Business Service
  → DatabaseService
  → Drizzle
  → mysql2 Pool
  → MySQL
```

## Allowed

```ts
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ExampleService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  findAll() {
    return this.database.db.select().from(exampleTable);
  }
}
```

## Forbidden outside `src/database`

```ts
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

const pool = mysql.createPool(...);
const db = drizzle(pool);
```

Also forbidden:

```ts
@Inject(DATABASE)
@Inject(MYSQL_POOL)
```

Migration, seed and reset scripts live in `src/database`; they are infrastructure
scripts and may use `mysql2` directly.
