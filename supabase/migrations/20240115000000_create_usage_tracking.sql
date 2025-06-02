-- Create usage tracking table
create table public.usage_tracking (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    month_year text not null, -- Format: "2024-01"
    count integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure one record per user per month
    unique(user_id, month_year)
);

-- Create RLS policies
alter table public.usage_tracking enable row level security;

-- Policy: Users can read their own usage data
create policy "Users can read own usage data" on public.usage_tracking
    for select using (auth.uid() = user_id);

-- Policy: Users can insert their own usage data
create policy "Users can insert own usage data" on public.usage_tracking
    for insert with check (auth.uid() = user_id);

-- Policy: Users can update their own usage data
create policy "Users can update own usage data" on public.usage_tracking
    for update using (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend operations)
create policy "Service role full access to usage tracking" on public.usage_tracking
    for all using (current_setting('role') = 'service_role');

-- Create indexes for better performance
create index usage_tracking_user_id_idx on public.usage_tracking(user_id);
create index usage_tracking_month_year_idx on public.usage_tracking(month_year);
create index usage_tracking_user_month_idx on public.usage_tracking(user_id, month_year);

-- Create function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_usage_tracking_updated_at
    before update on public.usage_tracking
    for each row
    execute function public.update_updated_at_column();

-- Create function to increment usage for a user
create or replace function public.increment_user_usage(p_user_id uuid)
returns void as $$
declare
    current_month_year text;
begin
    -- Get current month in YYYY-MM format
    current_month_year := to_char(now(), 'YYYY-MM');
    
    -- Insert or update usage count
    insert into public.usage_tracking (user_id, month_year, count)
    values (p_user_id, current_month_year, 1)
    on conflict (user_id, month_year)
    do update set 
        count = usage_tracking.count + 1,
        updated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;

-- Create function to reset usage for a user (for subscription resets)
create or replace function public.reset_user_usage(p_user_id uuid, p_month_year text default null)
returns void as $$
declare
    target_month_year text;
begin
    -- Use provided month_year or current month
    target_month_year := coalesce(p_month_year, to_char(now(), 'YYYY-MM'));
    
    -- Reset usage count to 0 for the specified month
    insert into public.usage_tracking (user_id, month_year, count)
    values (p_user_id, target_month_year, 0)
    on conflict (user_id, month_year)
    do update set 
        count = 0,
        updated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;

-- Create function to get current usage for a user
create or replace function public.get_current_usage(p_user_id uuid)
returns integer as $$
declare
    current_month_year text;
    usage_count integer;
begin
    -- Get current month in YYYY-MM format
    current_month_year := to_char(now(), 'YYYY-MM');
    
    -- Get usage count for current month
    select count into usage_count
    from public.usage_tracking
    where user_id = p_user_id and month_year = current_month_year;
    
    -- Return 0 if no record found
    return coalesce(usage_count, 0);
end;
$$ language plpgsql security definer; 