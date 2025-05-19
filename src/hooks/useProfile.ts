
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  preferred_wpm: number;
  calibration_status: string;
};

type CalibrationResult = {
  id: string;
  passage_id: string;
  wpm_tested: number;
  accuracy_score: number;
  comprehension_score: number;
  created_at: string;
};

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfile(data);
        
        // Also fetch calibration results
        const { data: calibration, error: calibrationError } = await supabase
          .from('calibration_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (calibrationError) {
          throw calibrationError;
        }
        
        setCalibrationResults(calibration);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const updatePreferredWpm = async (wpm: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_wpm: wpm })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, preferred_wpm: wpm } : null);
      
      toast({
        title: 'Settings Updated',
        description: `Your preferred reading speed is now ${wpm} WPM.`,
      });
    } catch (error) {
      console.error('Error updating WPM:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your reading speed.',
        variant: 'destructive'
      });
    }
  };

  const updateCalibrationStatus = async (status: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ calibration_status: status })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, calibration_status: status } : null);
    } catch (error) {
      console.error('Error updating calibration status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your calibration status.',
        variant: 'destructive'
      });
    }
  };

  const saveCalibrationResult = async (
    passageId: string, 
    wpm: number, 
    accuracyScore: number, 
    comprehensionScore: number
  ) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('calibration_results')
        .insert({
          user_id: user.id,
          passage_id: passageId,
          wpm_tested: wpm,
          accuracy_score: accuracyScore,
          comprehension_score: comprehensionScore
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setCalibrationResults(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error saving calibration result:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your calibration results.',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    profile,
    isLoading,
    calibrationResults,
    updatePreferredWpm,
    updateCalibrationStatus,
    saveCalibrationResult
  };
}
