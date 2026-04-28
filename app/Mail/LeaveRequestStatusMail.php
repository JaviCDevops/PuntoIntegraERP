<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LeaveRequestStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public LeaveRequest $leave;

    public function __construct(LeaveRequest $leave)
    {
        $leave->loadMissing('employee.user');
        $this->leave = $leave;
    }

    public function build()
    {
        $statusLabel = $this->leave->status === 'aprobada' ? 'aprobada' : 'rechazada';

        return $this->subject('Tu solicitud de vacaciones fue ' . $statusLabel)
            ->view('emails.leave_request_status')
            ->with([
                'leave' => $this->leave,
                'employee' => $this->leave->employee,
                'user' => $this->leave->employee?->user,
            ]);
    }
}