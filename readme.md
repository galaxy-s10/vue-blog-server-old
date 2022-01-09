# sql

## day_date表

```sql
CREATE DEFINER=`root`@`%` PROCEDURE `insert_many_dates`( number_to_insert INT )
BEGIN
	
	SET @x = 0;
	
	SET @date = '2022-01-01';
	REPEAT
			
			SET @x = @x + 1;
		INSERT INTO dayData ( today )
		VALUES
			( @date );
		
		SET @date = DATE_ADD( @date, INTERVAL 1 DAY );
		UNTIL @x >= number_to_insert 
	END REPEAT;

END
```

```sql
# call insert_many_dates(3650) # 从2022-01-01起，插入x个日期
# select count(*) FROM dayData
# TRUNCATE dayData # 删除表数据
```

