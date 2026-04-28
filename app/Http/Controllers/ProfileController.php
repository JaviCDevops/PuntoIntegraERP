<?php

namespace App\Http\Controllers;

use App\Mail\LeaveRequestNotificationMail;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

    public function edit(Request $request): Response
    {
        $employee = $request->user()
            ->employee()
            ->with([
                'documents' => fn ($query) => $query->latest(),
                'leaves' => fn ($query) => $query->latest('start_date'),
            ])
            ->first();

        if ($employee) {
            $employee->append(['vacation_balance', 'formatted_rut']);
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'employee' => $employee,
        ]);
    }

    public function storeLeave(Request $request): RedirectResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->with('error', 'No tienes ficha de empleado asociada para registrar una solicitud.');
        }

        $data = $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $data['employee_id'] = $employee->id;
        $data['status'] = 'pendiente';

        $leave = LeaveRequest::create($data);
        $leave->loadMissing('employee.user');

        $this->notifyLeaveRequest($leave);

        return back()->with('success', 'Solicitud ingresada correctamente.');
    }

    private function notifyLeaveRequest(LeaveRequest $leave): void
    {
        $recipients = $this->getVacationRequestRecipients();

        if (empty($recipients)) {
            return;
        }

        Mail::to($recipients)->send(new LeaveRequestNotificationMail($leave));
    }

    private function getVacationRequestRecipients(): array
    {
        $emails = [];
        $path = storage_path('app/vacation_request_recipient.txt');

        if (file_exists($path)) {
            $email = trim(file_get_contents($path));
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emails[] = $email;
            }
        }

        if (empty($emails)) {
            $emails = User::all()
                ->filter(fn ($user) => $user->hasPermission('manage_users'))
                ->pluck('email')
                ->toArray();
        }

        return array_values(array_unique($emails));
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
