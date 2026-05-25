<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FournisseurReplyNotification extends Notification
{
    use Queueable;

    protected $commande_id;
    protected $reference;
    protected $fournisseur_name;
    protected $message;

    public function __construct($commande_id, $reference, $fournisseur_name, $message)
    {
        $this->commande_id = $commande_id;
        $this->reference = $reference;
        $this->fournisseur_name = $fournisseur_name;
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
            'message'     => "{$this->fournisseur_name} a répondu : {$this->message}",
            'category'    => 'fournisseur_reply'
        ];
    }
}
