<?php

namespace App\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class PlacemarkerRepository
 * @package App\Repository
 */
class PlacemarkerRepository extends EntityRepository
{
    /**
     *   Метод инициирует запросы к БД и возвращает
     *   все найденные метки в круге в виде массива
     *
     *   $lat  = 59.9492;   широта точки центра круга поиска
     *   $lon  = 30.3145;   долгота  -//-
     *   $dist = 50;        радиус поиска / км
     *
     * @param $lat
     * @param $lon
     * @param $radius
     * @return array
     */
    public function findPlacemarks(float $lat, float $lon, int $radius): array
    {
        $conn = $this->getEntityManager()->getConnection();
        return $conn->fetchAll("CALL searchPlacemarkers('{$lat}','{$lon}','{$radius}')");
    }
}

