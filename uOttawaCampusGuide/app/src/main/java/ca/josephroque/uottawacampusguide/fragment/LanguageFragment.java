package ca.josephroque.uottawacampusguide.fragment;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;

import ca.josephroque.uottawacampusguide.R;

/**
 * Created by Joseph Roque on 15-05-09
 *
 * Provides UI and methods for the user to select a language preference.
 *
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link LanguageFragment.OnLanguageSelectListener} interface
 * to handle interaction events.
 * Use the {@link LanguageFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LanguageFragment extends Fragment
    implements View.OnClickListener
{

    /** Reference to activity used for callback methods */
    private OnLanguageSelectListener mListener;

    /** Layout which displays english instructions to user */
    private RelativeLayout mRelativeLayoutEnglish;
    /** Layout which displays french instructions to user */
    private RelativeLayout mRelativeLayoutFrench;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment LanguageFragment.
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

        // Gets references to two layouts which offer language options
        mRelativeLayoutEnglish = (RelativeLayout)rootView.findViewById(R.id.rl_lang_en);
        mRelativeLayoutFrench = (RelativeLayout)rootView.findViewById(R.id.rl_lang_fr);

        mRelativeLayoutEnglish.setOnClickListener(this);
        mRelativeLayoutFrench.setOnClickListener(this);

        return rootView;
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        try
        {
            mListener = (OnLanguageSelectListener) activity;
        } catch (ClassCastException e)
        {
            throw new ClassCastException(activity.toString()
                    + " must implement OnLanguageSelectListener");
        }
    }

    @Override
    public void onDetach()
    {
        super.onDetach();
        mListener = null;
    }

    @Override
    public void onClick(View src)
    {
        if (mListener != null)
        {
            mListener.onLanguageSelected(src == mRelativeLayoutEnglish);
        }
    }

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     */
    public interface OnLanguageSelectListener
    {
        /**
         * Called when the user selects a language from the options.
         * The available language options are English or French.
         * @param isEnglish true if the selected language was English. False, if French.
         */
        public void onLanguageSelected(boolean isEnglish);
    }

}
