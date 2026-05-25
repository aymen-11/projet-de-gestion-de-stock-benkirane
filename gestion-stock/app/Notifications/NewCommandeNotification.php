<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCommandeNotification extends Notification
{
    use Queueable;

    protected $commande_id;
    protected $reference;
    protected $message;

    public function __construct($commande_id, $reference, $message)
    {
        $this->commande_id = $commande_id;
        $this->reference = $reference;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'commande_id' => $this->commande_id,
            'reference'   => $this->reference,
            'type'        => 'info',
            'message'     => $this->message,
            'category'    => 'commande'
        ];
    }
}
