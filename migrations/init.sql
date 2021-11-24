#-------  DATABASE
DROP DATABASE IF EXISTS Placemarkers;
CREATE DATABASE IF NOT EXISTS `Placemarkers` CHARACTER SET utf8 COLLATE utf8_general_ci;
USE Placemarkers;

# ---
DROP TABLE IF EXISTS Placemarkers;
CREATE TABLE IF NOT EXISTS Placemarkers
(
    id   INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) DEFAULT NULL,
    lat  DECIMAL(9, 6) DEFAULT NULL,
    lon  DECIMAL(9, 6) DEFAULT NULL,
    PRIMARY KEY (id)
)
    ENGINE = InnoDB
    CHARACTER SET utf8
    COLLATE utf8_general_ci
    COMMENT = 'Список меток с координатами';

# ---
DROP FUNCTION IF EXISTS harvesine;
DELIMITER $$
CREATE FUNCTION harvesine(lat1 double, lon1 double, lat2 double, lon2 double)
    RETURNS double
    return  6371 * 2 * ASIN(SQRT(POWER(SIN((lat1 - abs(lat2)) * pi()/180 / 2), 2)
        + COS(abs(lat1) * pi()/180 ) * COS(abs(lat2) * pi()/180) * POWER(SIN((lon1 - lon2) * pi()/180 / 2), 2) ))
$$
DELIMITER ;

# ---
DROP PROCEDURE IF EXISTS searchPlacemarkers;
DELIMITER $$
CREATE PROCEDURE searchPlacemarkers(IN latitude  DOUBLE,
                                    IN longitude DOUBLE,
                                    IN radius    INT)
BEGIN
    SET NAMES 'utf8';
    SET @lat   = latitude;
    SET @lon   = longitude;
    SET @dist  = radius;
    SET @rlon1 = @lon-@dist/abs(cos(radians(@lat))*111.2);
    SET @rlon2 = @lon+@dist/abs(cos(radians(@lat))*111.2);
    SET @rlat1 = @lat-(@dist/111.2 );
    SET @rlat2 = @lat+(@dist/111.2 );

    SELECT id,
           name,
           lat,
           lon,
           harvesine(lat, lon, @lat, @lon ) AS dist
    FROM Placemarkers
    WHERE st_within(point(lon, lat), envelope(linestring(point(@rlon1, @rlat1), point(@rlon2, @rlat2))))
    HAVING dist < @dist
    ORDER BY dist DESC;
END;
$$
DELIMITER ;
