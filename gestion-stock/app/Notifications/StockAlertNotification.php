<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockAlertNotification extends Notification
{
    use Queueable;

    protected $article_id;
    protected $type;
    protected $message;

    public function __construct($article_id, $type, $message)
    {
        $this->article_id = $article_id;
        $this->type = $type;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'article_id' => $this->article_id,
            'type'       => $this->type,
            'message'    => $this->message,
            'category'   => 'stock'
        ];
    }
}
