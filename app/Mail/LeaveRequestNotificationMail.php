<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LeaveRequestNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public LeaveRequest $leave;

    /**
     * Create a new message instance.
     */
    public function __construct(LeaveRequest $leave)
    {
        $leave->loadMissing('employee.user');
        $this->leave = $leave;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Nueva solicitud de vacaciones')
                    ->view('emails.leave_request_notification')
                    ->with([
                        'leave' => $this->leave,
                        'employee' => $this->leave->employee,
                        'user' => $this->leave->employee->user,
                    ]);
    }
}
