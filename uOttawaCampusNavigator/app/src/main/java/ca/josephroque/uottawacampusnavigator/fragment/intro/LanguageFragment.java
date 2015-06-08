package ca.josephroque.uottawacampusnavigator.fragment.intro;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import ca.josephroque.uottawacampusnavigator.R;

/**
 * Created by Joseph Roque on 15-05-09
 *
 * Provides UI and methods for the user to select a language preference.
 *
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link LanguageFragment.LanguageCallbacks} interface
 * to handle interaction events.
 * Use the {@link LanguageFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LanguageFragment extends Fragment
        implements View.OnClickListener
{
    // Constant values

    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "LanguageFragment";

    // Objects

    /** Instance of callback interface. */
    private LanguageCallbacks mCallback;

    // Arrays, data structures

    // Primitive variables

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return new instance of fragment LanguageFragment
     */
    public static LanguageFragment newInstance()
    {
        return new LanguageFragment();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment
        final View rootView = inflater.inflate(R.layout.fragment_language, container, false);

        rootView.findViewById(R.id.rl_lang_en).setOnClickListener(this);
        rootView.findViewById(R.id.rl_lang_en).setOnClickListener(this);

        return rootView;
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        try
        {
            mCallback = (LanguageCallbacks) activity;
        }
        catch (ClassCastException e)
        {
            throw new ClassCastException(activity.toString()
                    + " must implement LanguageCallbacks");
        }
    }

    @Override
    public void onDetach()
    {
        super.onDetach();
        mCallback = null;
    }

    @Override
    public void onClick(View src)
    {
        if (mCallback != null)
        {
            mCallback.onLanguageSelected(src.getId() == R.id.rl_lang_en);
        }
    }

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     */
    public interface LanguageCallbacks
    {
        /**
         * Called when the user selects a language from the options.
         * The available language options are English or French.
         *
         * @param isEnglish true if the selected language was English. False, if French.
         */
        void onLanguageSelected(boolean isEnglish);
    }

}
