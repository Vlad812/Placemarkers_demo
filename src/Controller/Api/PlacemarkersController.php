<?php

namespace App\Controller\Api;

use App\Entity\Placemarker;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class PlacemarkersController
 * @package App\Controller
 */
class PlacemarkersController extends AbstractController
{
    /**
     *  Новая метка
     *
     * @Route("placemarks/add")
     * @param Request $request
     * @return JsonResponse
     */
    public function addAction(Request $request): JsonResponse
    {
        try {
           $data = $request->query->get('user_data');

            if(empty($data)) {
                throw new \Exception('Request data is empty !');
            }

            $data = json_decode($data,true);

            if(empty($data['name'])) {
                throw new \Exception('Placemarker`s name is empty !');
            }
            if(empty($data['lat'])) {
                throw new \Exception('Placemarker`s latitude is empty !');
            }
            if(empty($data['lon'])) {
                throw new \Exception('Placemarker`s longitude is empty !');
            }

            $placemarker = new Placemarker();
            $placemarker->setName($data['name']);
            $placemarker->setLat($data['lat']);
            $placemarker->setLon($data['lon']);

            $em = $this->getDoctrine()->getManager();
            $em->persist($placemarker);
            $em->flush();

            $jsonResponse = $this->json(['msg'    => 'Добавлено успешно !',
                                         'status' => true,
                                         'id'     => $placemarker->getId()]
            );
        }
        catch (\Exception $e) {

            // здесь отправляем ошибку в багтрекер, логгер
            //$incidentId  = \Sentry\captureException($e);
            $incidentId   = 'a3e435f5vfv';
            $jsonResponse = $this->json(['incidentId' => $incidentId,
                                         'status'     => false
            ]);
            $jsonResponse->setStatusCode(500);
        }
        return $jsonResponse;
    }

    /**
     *  Удаление Метки
     *
     * @Route("placemarks/delete/{id}")
     * @param EntityManagerInterface $em
     * @param int $id
     * @return JsonResponse
     */
    public function deleteAction(EntityManagerInterface $em, int $id): JsonResponse
    {
        try {
            $placemarker = $em->getRepository('App:Placemarker')->find($id);

            if(!$placemarker) {
                throw new \Exception('Action Delete : Placemarker is not found by this ID : ' .  $id);
            }
            $em->remove($placemarker);
            $em->flush();

            $jsonResponse = $this->json(['msg'    => 'Метка удалена успешно !',
                                         'status' => true]);
        }
        catch (\Exception $e) {
            // здесь отправляем ошибку в багтрекер, логгер
            //$incidentId  = \Sentry\captureException($e);
            $incidentId   = 'del2adelsfsf';
            $jsonResponse = $this->json(['incidentId' => $incidentId,
                                         'status'     => false
            ]);
            $jsonResponse->setStatusCode(500);
        }
        return $jsonResponse;
    }

    /**
     *  Редактирование Метки
     *
     * @Route("placemarks/edit/{id}")
     * @param Request $request
     * @param EntityManagerInterface $em
     * @param int $id
     * @return JsonResponse
     */
    public function editAction(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        try {
            $placemarker = $em->getRepository('App:Placemarker')->find($id);

            if(!$placemarker) {
                throw new \Exception('Action Edit : Placemarker is not found by this ID : ' . $id);
            }

            $data = $request->query->get('user_data');

            if(empty($data)) {
                throw new \Exception('Action Edit : Request data is empty !');
            }

            $data = json_decode($data,true);

            $placemarker->setName($data['name']);
            $placemarker->setLat($data['lat']);
            $placemarker->setLon($data['lon']);
            $em->flush();

            $jsonResponse = $this->json(['msg'    => 'Метка Изменена успешно !',
                                         'status' => true]);
        }
        catch (\Exception $e) {
            // здесь отправляем ошибку в багтрекер, логгер
            //$incidentId  = \Sentry\captureException($e);
            $incidentId   = 'editl2adelsfsf';
            $jsonResponse = $this->json(['incidentId' => $incidentId,
                                         'status'     => false
            ]);
            $jsonResponse->setStatusCode(500);
        }
        return $jsonResponse;
    }
}
