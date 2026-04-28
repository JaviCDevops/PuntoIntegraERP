<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class FixUserPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-user-permissions {--user= : Fix permissions for specific user email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix corrupted user permissions by ensuring they are valid arrays';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userEmail = $this->option('user');
        
        if ($userEmail) {
            $user = User::where('email', $userEmail)->first();
            if (!$user) {
                $this->error("User with email {$userEmail} not found.");
                return;
            }
            
            $this->fixUserPermissions($user);
            $this->info("Fixed permissions for user {$userEmail}");
        } else {
            $users = User::all();
            $fixedCount = 0;
            
            foreach ($users as $user) {
                if ($this->fixUserPermissions($user)) {
                    $fixedCount++;
                }
            }
            
            $this->info("Fixed permissions for {$fixedCount} users out of " . $users->count());
        }
    }
    
    private function fixUserPermissions(User $user): bool
    {
        $originalPermissions = $user->getRawOriginal('permissions');
        $currentPermissions = $user->permissions;
        
        // Check if permissions need fixing
        if (!is_array($currentPermissions)) {
            $this->warn("User {$user->email}: permissions is not an array (type: " . gettype($currentPermissions) . ", value: " . json_encode($currentPermissions) . ")");
            
            // Try to fix by setting to empty array
            $user->permissions = [];
            $user->save();
            
            $this->info("Fixed user {$user->email}: set permissions to empty array");
            return true;
        }
        
        // Check for invalid permission values
        $validPermissions = ['dashboard', 'quotes', 'projects', 'clients', 'rrhh', 'vehicles', 'areas', 'users', 'manage_users'];
        $invalidPermissions = array_diff($currentPermissions, $validPermissions);
        
        if (!empty($invalidPermissions)) {
            $this->warn("User {$user->email}: found invalid permissions: " . implode(', ', $invalidPermissions));
            
            // Remove invalid permissions
            $user->permissions = array_intersect($currentPermissions, $validPermissions);
            $user->save();
            
            $this->info("Fixed user {$user->email}: removed invalid permissions");
            return true;
        }
        
        return false;
    }
}
