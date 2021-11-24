<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class PlacemarkersController
 * @package App\Controller
 */
class PlacemarkersController extends AbstractController
{
    /**
     * Список Меток
     *
     * @Route("/")
     * @param EntityManagerInterface $em
     * @return Response
     */
    public function indexAction(EntityManagerInterface $em): Response
    {
        $placeMarksList = $em->getRepository('App:Placemarker')
                             ->findAll();

        return $this->render('markers/table.html.twig',
                                  ['placeMarksList' => $placeMarksList ?? []]
        );
    }

    /**
     *  Задать область поиска
     *
     * @Route("/search")
     * @return Response
     */
    public function searchAction(): Response
    {
        return $this->render('markers/search_map.html.twig');
    }

    /**
     *  Результат поиска меток
     *
     * @Route("/result")
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return Response
     */
    public function resultAction(Request $request, EntityManagerInterface $em): Response
    {
        try {
            $lat = $request->query->get('lat');

            if(is_null($lat)) {
                throw new \Exception('Action Result: Request parameter lat is not found !');
            }

            $lon = $request->query->get('lon');

            if(is_null($lon)) {
                throw new \Exception('Action Result: Request parameter lon is not found !');
            }

            $radius = $request->query->get('radius');

            if(is_null($radius)) {
                throw new \Exception('Action Result: Request parameter radius is not found ! ');
            }

            $res = $em->getRepository('App:Placemarker')
                      ->findPlacemarks($lat, $lon, $radius);

            $area = ['lat'    => $lat,
                     'lon'    => $lon,
                     'radius' => $radius * 1000];

            $response = $this->render('markers/result.html.twig',
                                           ['res' => $res, 'area' => $area]);
        }
        catch(\Exception $e) {

            // здесь отправляем ошибку в багтрекер, логгер
            //$incidentId  = \Sentry\captureException($e);
            $incidentId   = 'resl2adelsfsf';
            $response = $this->render('page_500.html.twig',
                                          ['incidentId' => $incidentId] );
            $response->setStatusCode(500);
        }
        return $response;
    }
}
